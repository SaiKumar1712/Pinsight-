import re

file_path = "/Users/mac-24/Downloads/Archive1/Pinsight 1/ViewModels/AdminViewModel.swift"
with open(file_path, "r") as f:
    content = f.read()

# We want to find patterns like:
# NetworkManager.shared.fetchRequest(...) { (result: ...) in
#     self.isLoading = false
#     switch result { ... }
# }

def repl(match):
    prefix = match.group(1)
    body = match.group(2)
    # properly indent the body by 4 spaces
    indented_body = "\n".join("    " + line if line.strip() else line for line in body.split("\n"))
    return prefix + "\n        DispatchQueue.main.async {\n" + indented_body + "        }\n    }"

# Regex explanation:
# find NetworkManager.shared... { (result: ...) in
# capture everything until the balancing closing brace
pattern = r'(NetworkManager\.shared\.[a-zA-Z]+\(.*?\)\s*\{\s*\(result:[^)]+\)\s*in)\n(.*?)(^\s*\})'

new_content = re.sub(pattern, repl, content, flags=re.MULTILINE | re.DOTALL)

with open(file_path, "w") as f:
    f.write(new_content)

print("Modification complete.")
