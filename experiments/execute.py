"""Grade generated code against Orchid's {input, output, relation} test cases."""
import json
import re
import subprocess
import sys
import tempfile
import os

TIMEOUT = 10

HARNESS = '''
import json, sys
{code}

_cases = json.loads({cases!r})
_passed = 0
for c in _cases:
    try:
        _got = {entry}(*eval("(" + c["input"] + ",)"))
        _exp = eval(c["output"])
        _ok = (_got == _exp) if c.get("relation", "==") == "==" else eval(
            "_got " + c["relation"] + " _exp")
    except Exception:
        _ok = False
    _passed += bool(_ok)
print(json.dumps({{"passed": _passed, "total": len(_cases)}}))
'''


def extract_code(response: str) -> str:
    """Strip thinking, take the last fenced block, else the raw response."""
    body = re.sub(r"<think>.*?</think>", "", response, flags=re.S)
    blocks = re.findall(r"```(?:python)?\n(.*?)```", body, flags=re.S)
    return (blocks[-1] if blocks else body).strip()


def grade(response: str, entry_point: str, test_cases: list) -> dict:
    code = extract_code(response)
    src = HARNESS.format(code=code, cases=json.dumps(test_cases), entry=entry_point)
    with tempfile.NamedTemporaryFile("w", suffix=".py", delete=False) as f:
        f.write(src)
        path = f.name
    try:
        r = subprocess.run([sys.executable, path], capture_output=True,
                           text=True, timeout=TIMEOUT)
        out = json.loads(r.stdout.strip().splitlines()[-1])
        out["passed_all"] = out["passed"] == out["total"] and out["total"] > 0
        return out
    except Exception as e:
        return {"passed": 0, "total": len(test_cases), "passed_all": False,
                "error": type(e).__name__}
    finally:
        os.unlink(path)


def _self_check():
    cases = [{"input": "[1.0, 2.0, 3.9, 4.0], 0.3", "output": "True", "relation": "=="},
             {"input": "[1.0, 2.0, 3.9, 4.0], 0.05", "output": "False", "relation": "=="}]
    good = """```python
from typing import List
def has_close_elements(numbers: List[float], threshold: float) -> bool:
    return any(abs(a - b) < threshold
               for i, a in enumerate(numbers)
               for j, b in enumerate(numbers) if i != j)
```"""
    bad = "```python\ndef has_close_elements(numbers, threshold):\n    return False\n```"
    thinky = "<think>hmm let me think</think>\n" + good
    assert grade(good, "has_close_elements", cases)["passed_all"] is True
    assert grade(bad, "has_close_elements", cases)["passed_all"] is False
    assert grade(thinky, "has_close_elements", cases)["passed_all"] is True
    assert grade("total garbage", "has_close_elements", cases)["passed_all"] is False
    assert grade("```python\nimport time\ndef has_close_elements(n,t):\n    time.sleep(60)\n```",
                 "has_close_elements", cases)["passed_all"] is False
    print("execute.py self-check OK")


if __name__ == "__main__":
    _self_check()
