package com.erp.capitalerp.services.validation;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.HandlerMapping;

import com.erp.capitalerp.dto.UserUpdateDTO;
import com.erp.capitalerp.entities.User;
import com.erp.capitalerp.repositories.UserRepository;
import com.erp.capitalerp.controlles.exceptions.FieldMessage;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UserUpdateValidator implements ConstraintValidator<UserUpdateValid, UserUpdateDTO> {
	
    @Autowired
    private HttpServletRequest request;

    @Autowired
    private UserRepository repository;
    
	@Override
	public void initialize(UserUpdateValid ann) {
	}

	@Override
	public boolean isValid(UserUpdateDTO dto, ConstraintValidatorContext context) {
		
        var uriVars = (Map<String, String>) request.getAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE);
        Long userId = Long.parseLong(uriVars.get("id"));


		List<FieldMessage> list = new ArrayList<>();
		// Validação do email
        User user = repository.findByEmail(dto.getEmail());
        
        if (user != null && !user.getId().equals(userId)) {
            list.add(new FieldMessage("email", "Email already exists"));
        }
		// Coloque aqui seus testes de validação, acrescentando objetos FieldMessage à lista
		
		for (FieldMessage e : list) {
			context.disableDefaultConstraintViolation();
			context.buildConstraintViolationWithTemplate(e.getMessage()).addPropertyNode(e.getFieldName())
					.addConstraintViolation();
		}
		return list.isEmpty();
	}

}