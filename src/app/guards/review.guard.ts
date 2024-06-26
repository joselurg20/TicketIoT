import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../services/users/login.service';
import { Routes } from '../utilities/routes';

export const reviewGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService)
  const router = inject(Router);

  let response = true;

  if (!loginService.isLogged()) {
    response = false;
    router.navigate([Routes.login]);
  }
  return response;
};