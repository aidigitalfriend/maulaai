#!/usr/bin/env python3
"""Strip TypeScript types from a JavaScript file"""
import re
import sys

if len(sys.argv) < 2:
    print("Usage: python3 strip_ts.py <file.js>")
    sys.exit(1)

with open(sys.argv[1], 'r') as f:
    content = f.read()

# 1. Remove return type annotations like ): Promise<void> { or ): string {
content = re.sub(r'\): Promise<[^>]+> \{', ') {', content)
content = re.sub(r'\): string \{', ') {', content)
content = re.sub(r'\): void \{', ') {', content)
content = re.sub(r'\): boolean \{', ') {', content)
content = re.sub(r'\): number \{', ') {', content)

# 2. Remove variable type annotations
content = re.sub(r': nodemailer\.Transporter \| null = null', ' = null', content)
content = re.sub(r'const (\w+): Record<[^>]+> = \{', r'const \1 = {', content)

# 3. Remove simple param types like (param: string, param2: number)
content = re.sub(r'(\w+): string,', r'\1,', content)
content = re.sub(r'(\w+): string\)', r'\1)', content)
content = re.sub(r'(\w+): number,', r'\1,', content)
content = re.sub(r'(\w+): number\)', r'\1)', content)
content = re.sub(r'(\w+): boolean,', r'\1,', content)
content = re.sub(r'(\w+): boolean\)', r'\1)', content)

# 4. Complex inline types like (data: { prop: string ... }) - convert to just (data)
# This handles multi-line inline type definitions
content = re.sub(r'\(data: \{[^}]+\}\)', '(data)', content, flags=re.DOTALL)

# 5. catch (error: any)
content = re.sub(r'catch \(error: any\)', 'catch (error)', content)

# 6. string[] type annotations
content = re.sub(r'(\w+): string\[\]', r'\1', content)

# 7. Optional type annotations like ?: string
content = re.sub(r'(\w+)\?: string', r'\1', content)
content = re.sub(r'(\w+)\?: number', r'\1', content)

with open(sys.argv[1], 'w') as f:
    f.write(content)

print(f"✓ Stripped TypeScript types from {sys.argv[1]}")
