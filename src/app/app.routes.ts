import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { Clientes } from './pages/clientes/clientes';
import { Fabricantes } from './pages/fabricantes/fabricantes';
import { Home } from './pages/home/home';
import { HomeSection } from './pages/home/home-section';
import { Login } from './pages/login/login';
import { Produtos } from './pages/produtos/produtos';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'home.html',
    component: Home,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        component: HomeSection,
        data: {
          title: 'Bem-vindo!',
          description:
            'Você está na página inicial do sistema. Estamos felizes em ter você por aqui.',
        },
      },
      {
        path: 'produtos',
        component: Produtos,
      },
      {
        path: 'usuarios',
        component: HomeSection,
        data: { title: 'Cadastro de Usuários' },
      },
      {
        path: 'clientes',
        component: Clientes,
      },
      {
        path: 'fabricantes',
        component: Fabricantes,
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
