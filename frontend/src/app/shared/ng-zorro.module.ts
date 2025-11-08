import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// NG-ZORRO Modules
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';

import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';

const NG_ZORRO_MODULES = [
  NzLayoutModule,
  NzMenuModule,
  NzBreadCrumbModule,
  NzIconModule,
  NzButtonModule,
  NzDropDownModule,
  NzSpinModule,
  NzCardModule,
  NzGridModule,
  NzFormModule,
  NzInputModule,
  NzTableModule,
  NzModalModule,
  NzMessageModule,
  NzNotificationModule,
  NzDrawerModule,
  NzSelectModule,
  NzDatePickerModule,
  NzToolTipModule,
  NzAlertModule,
  NzCheckboxModule,
  NzDividerModule,
  NzPopconfirmModule,
  NzProgressModule,
  NzRadioModule,
  NzSwitchModule,
  NzTabsModule,
  NzTagModule,
  NzTimePickerModule,
  NzUploadModule,
  NzEmptyModule,
  NzBadgeModule,
  NzStepsModule,
  NzPaginationModule,
  NzListModule,
  NzStatisticModule
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
export class NgZorroModule { }