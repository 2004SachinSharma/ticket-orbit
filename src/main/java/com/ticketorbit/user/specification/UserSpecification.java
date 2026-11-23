package com.ticketorbit.user.specification;

import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import org.springframework.data.jpa.domain.Specification;

public class UserSpecification {

private  UserSpecification(){}

public static Specification<User> hasActive(Boolean active){
	return (root, query, cb) -> cb.equal(root.get("active"), active);
}

public static Specification<User> hasRole(Role role) {
	return (root, query, cb) -> cb.equal(root.get("role"), role);
}
}
