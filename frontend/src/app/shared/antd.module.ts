import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';



import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzEmptyModule } from 'ng-zorro-antd/empty';

const NG_ZORRO_MODULES = [
  NzLayoutModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzIconModule,
  NzButtonModule,
  NzInputModule,
  NzFormModule,
  NzTableModule,
  NzModalModule,
  NzMessageModule,
  NzNotificationModule,
  NzDrawerModule,
  NzDropDownModule,
  NzCardModule,
  NzSpinModule,
  NzAlertModule,
  NzTabsModule,
  NzSelectModule,
  NzDatePickerModule,
  NzToolTipModule,
  NzPopconfirmModule,
  NzBadgeModule,
  NzStatisticModule,
  NzGridModule,
  NzDividerModule,
  NzEmptyModule
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ...NG_ZORRO_MODULES
  ],
  exports: [
    ...NG_ZORRO_MODULES
  ]
})
export class AntdModule { }