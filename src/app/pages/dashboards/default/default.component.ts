import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { emailSentBarChart, monthlyEarningChart } from './data';
import { ChartType } from './dashboard.model';
import { BsModalService, BsModalRef, ModalDirective } from 'ngx-bootstrap/modal';
import { EventService } from '../../../core/services/event.service';

import { ConfigService } from '../../../core/services/config.service';
import { ApiService } from 'src/app/core/services/api/api.service';
import { concatMap, map } from 'rxjs';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {
  modalRef?: BsModalRef;
  isVisible: string;

  emailSentBarChart: ChartType;
  monthlyEarningChart: ChartType;
  transactions: any;
  statData: any;
  config:any = {
    backdrop: true,
    ignoreBackdropClick: true
  };

  isActive: string;

  @ViewChild('content') content;
  @ViewChild('center', { static: false }) center?: ModalDirective;
  constructor(
    private modalService: BsModalService, 
    private configService: ConfigService, 
    private eventService: EventService,
    private api: ApiService
  ) {
  }

  ngOnInit() {

    /**
     * horizontal-vertical layput set
     */
    const attribute = document.body.getAttribute('data-layout');

    this.isVisible = attribute;
    const vertical = document.getElementById('layout-vertical');
    if (vertical != null) {
      vertical.setAttribute('checked', 'true');
    }
    if (attribute == 'horizontal') {
      const horizontal = document.getElementById('layout-horizontal');
      if (horizontal != null) {
        horizontal.setAttribute('checked', 'true');
      }
    }

    /**
     * Fetches the data
     */
    this.fetchData();
  }

  ngAfterViewInit() {
    setTimeout(() => {
     this.center?.show()
    }, 2000);
  }

  /**
   * Fetches the data
   */
  private fetchData() {
    this.emailSentBarChart = emailSentBarChart;
    this.monthlyEarningChart = monthlyEarningChart;

    this.isActive = 'year';
    this.api.getMembers()
    this.api.getMembers()
    .pipe(concatMap(
       (data: any[]) => 
        { 
          return this.configService.getConfig().pipe(map(configData => {
            this.transactions = configData.transactions;
            let totalRevenue = configData.statData.filter(data => data.title ==="Total Revenue")[0];
            this.statData = configData.statData.filter(el => { 
              
              switch (el.title) {
                case "Total Members":
                 return el.value = data.length.toString()
              
                case "Average Income":
                 return el.value = totalRevenue?.value ? `${'₵' +(parseFloat(totalRevenue.value.replace(/[^\d.-]/g, '')) / data.length).toFixed(0)}` : "0";
                  
                default:
                  return el;
              }
            });
          }));
        }
    )).subscribe()
  }
  opencenterModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  weeklyreport() {
    this.isActive = 'week';
    this.emailSentBarChart.series =
      [{
        name: 'Tithe',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Offering',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, {
        name: 'Contributions',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Donation',
        data: [32, 2, 10, 14, 12, 8, 18, 10, 33, 5, 2, 18]
      }];
      this.emailSentBarChart.xaxis= {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
  }

  monthlyreport() {
    this.isActive = 'month';
    this.emailSentBarChart.series =
      [{
        name: 'Tithe',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48]
      }, {
        name: 'Offering',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22]
      }, {
        name: 'Contributions',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18]
      }, {
        name: 'Donation',
        data: [5, 18, 8, 33, 32, 2, 14, 10, 12, 2, 18, 10]
      }];
      this.emailSentBarChart.xaxis= {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    }
  }

  yearlyreport() {
    this.isActive = 'year';
    this.emailSentBarChart.series =
      [{
        name: 'Tithe',
        data: [13, 23, 20, 8, 13]
      }, {
        name: 'Offering',
        data: [11, 17, 15, 15, 21]
      }, {
        name: 'Contributions',
        data: [44, 55, 41, 67, 22]
      }, {
        name: 'Donation',
        data: [10, 33, 12, 5, 18]
      }];

      this.emailSentBarChart.xaxis= {
        categories: ['2020', '2021', '2022', '2023', '2024'],
    }
  }


  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast('changeLayout', layout);
  }
}
