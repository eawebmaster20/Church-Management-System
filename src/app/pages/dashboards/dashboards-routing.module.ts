import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DefaultComponent } from './default/default.component';
import { Register2Component } from 'src/app/account/auth/register2/register2.component';
import { RegisterMemberComponent } from '../register-member/register-member.component';

const routes: Routes = [
    {
        path: 'default',
        component: DefaultComponent
    },
    {
        path: 'form',
        component: RegisterMemberComponent
    },
    {
        path: 'calender',
        component: RegisterMemberComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DashboardsRoutingModule {}
