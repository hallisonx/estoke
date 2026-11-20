import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { HomeSection } from './pages/home/home-section';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Login },
  {
    path: 'home.html',
    component: Home,
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
        component: HomeSection,
        data: { title: 'Cadastro de Produtos' },
      },
      {
        path: 'usuarios',
        component: HomeSection,
        data: { title: 'Cadastro de Usuários' },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
