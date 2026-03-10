import { CanActivateFn, Router } from '@angular/router';
import { AuthService} from '../services/auth.service';
import { inject } from '@angular/core';

export const ownerGuard: CanActivateFn = async (route, state) => {

const authService = inject(AuthService)
    const router = inject(Router)
  
    if(await authService.isOwner()){
      return true;
    }
    else
    {
      router.navigate(['/home'])
      return false;
    }
  
};
