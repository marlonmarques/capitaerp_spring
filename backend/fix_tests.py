import os
import re

base_path = 'src/test/java/com/erp/capitalerp'
mapping = {
    'entities/Cliente.java': 'domain/clientes/Cliente.java',
    'entities/User.java': 'domain/usuarios/User.java',
    'entities/Role.java': 'domain/usuarios/Role.java',
    'repositories/ClienteRepository.java': 'infrastructure/persistence/clientes/ClienteRepository.java',
    'repositories/UserRepository.java': 'infrastructure/persistence/usuarios/UserRepository.java',
    'repositories/RoleRepository.java': 'infrastructure/persistence/usuarios/RoleRepository.java',
    'services/ClienteService.java': 'application/clientes/ClienteService.java',
    'services/UserService.java': 'application/usuarios/UserService.java',
    'controlles/ClienteController.java': 'web/v1/clientes/ClienteController.java',
    'controlles/UserResource.java': 'web/v1/usuarios/UserResource.java',
    'dto/ClienteDTO.java': 'application/clientes/dto/ClienteDTO.java',
    'dto/UserDTO.java': 'application/usuarios/dto/UserDTO.java',
    'dto/UserInsertDTO.java': 'application/usuarios/dto/UserInsertDTO.java',
    'dto/UserUpdateDTO.java': 'application/usuarios/dto/UserUpdateDTO.java',
    'dto/RoleDTO.java': 'application/usuarios/dto/RoleDTO.java',
    'dto/ValidationError.java': 'application/shared/dto/ValidationError.java',
    'dto/FieldMessage.java': 'application/shared/dto/FieldMessage.java',
    'dto/CustomError.java': 'application/shared/dto/CustomError.java',
    'services/excepitos/DatabaseException.java': 'domain/shared/DatabaseException.java',
    'services/excepitos/ForbiddenException.java': 'domain/shared/ForbiddenException.java',
    'services/excepitos/ResourceEntityNotFoundException.java': 'domain/shared/ResourceEntityNotFoundException.java',
    'services/excepitos/ResourceNotFoundExcepiton.java': 'domain/shared/ResourceNotFoundExcepiton.java',
    'controlles/exceptions/ResourceExceptionHendler.java': 'web/v1/shared/ResourceExceptionHendler.java',
    'controlles/exceptions/StandardError.java': 'web/v1/shared/StandardError.java',
    'controlles/exceptions/ValidationError.java': 'web/v1/shared/ValidationError.java',
    'controlles/exceptions/FieldMessage.java': 'web/v1/shared/FieldMessage.java',
    'controlles/handles/ControllerExceptionHandler.java': 'web/v1/shared/ControllerExceptionHandler.java',
    'controlles/handles/StandardError.java': 'web/v1/shared/handles/StandardError.java',
    'controlles/handles/ValidationError.java': 'web/v1/shared/handles/ValidationError.java',
    'controlles/handles/FieldMessage.java': 'web/v1/shared/handles/FieldMessage.java',
    'services/validation/UserInsertValid.java': 'application/usuarios/validation/UserInsertValid.java',
    'services/validation/UserInsertValidator.java': 'application/usuarios/validation/UserInsertValidator.java',
    'services/validation/UserUpdateValid.java': 'application/usuarios/validation/UserUpdateValid.java',
    'services/validation/UserUpdateValidator.java': 'application/usuarios/validation/UserUpdateValidator.java',
}

pkg_map = {
    'com.erp.capitalerp.'+k.replace('.java', '').replace('/', '.'): 'com.erp.capitalerp.'+v.replace('.java', '').replace('/', '.') for k,v in mapping.items()
}

def fix_content(content):
    for old_pkg, new_pkg in pkg_map.items():
        content = re.sub(r'\b' + old_pkg.replace('.', r'\.') + r'\b', new_pkg, content)
    content = content.replace('com.erp.capitalerp.entities.*', 'com.erp.capitalerp.domain.*')
    content = content.replace('com.erp.capitalerp.dto.*', 'com.erp.capitalerp.application.shared.dto.*')
    return content

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            new_content = fix_content(content)
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)

# We also need to move the test directories if any test classes are directly mapped.
# Looking at the trace, UserServiceTest is in services/UserServiceTest.java,
# we should move it to application/usuarios/UserServiceTest.java.

for root, dirs, files in os.walk(base_path):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            # determine the original mapped equivalent
            rel_path = os.path.relpath(filepath, base_path)
            # basic translation
            old_pkg_str = rel_path.replace('.java', '')
            # e.g. services/UserServiceTest
            new_rel_path = rel_path
            
            # manual overrides for moving tests
            if rel_path.startswith('services/'):
                new_rel_path = rel_path.replace('services/', 'application/usuarios/')
            if rel_path.startswith('controlles/'):
                new_rel_path = rel_path.replace('controlles/', 'web/v1/usuarios/')
            if rel_path.startswith('repositories/'):
                new_rel_path = rel_path.replace('repositories/', 'infrastructure/persistence/usuarios/')
            
            # just handle the ones failing
            if new_rel_path != rel_path:
                n_path = os.path.join(base_path, new_rel_path)
                os.makedirs(os.path.dirname(n_path), exist_ok=True)
                
                with open(filepath, 'r') as f:
                    content = f.read()
                
                new_pkg = 'com.erp.capitalerp.' + os.path.dirname(new_rel_path).replace('/', '.')
                content = re.sub(r'package\s+com\.erp\.capitalerp\.[^;]+;', f'package {new_pkg};', content, 1)
                
                with open(n_path, 'w') as f:
                    f.write(content)
                os.remove(filepath)
                
print("Tests fixed")
