import os
import re

base_path = 'src/main/java/com/erp/capitalerp/config'

for file in ['H2Config.java', 'PostgresConfig.java', 'SqliteConfig.java']:
    p = os.path.join(base_path, file)
    if os.path.exists(p):
        with open(p, 'r') as f:
            content = f.read()
        
        content = content.replace('"com.erp.capitalerp.repositories"', '"com.erp.capitalerp.infrastructure.persistence"')
        content = content.replace('"com.erp.capitalerp.entities"', '"com.erp.capitalerp.domain"')
        
        with open(p, 'w') as f:
            f.write(content)

props = ['src/main/resources/application-test.properties', 'src/main/resources/application.properties', 'src/main/resources/application-dev.properties']
for p in props:
    if os.path.exists(p):
        with open(p, 'a') as f:
            f.write('\nspring.flyway.enabled=false\n')

print("Config patched")
