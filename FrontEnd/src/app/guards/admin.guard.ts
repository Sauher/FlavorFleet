import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const adminGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService)
    const router = inject(Router)
  
    if(await authService.isAdmin()){
      return true;
    }
    else
    {
      router.navigate(['/home'])
      return false;
    }
};
