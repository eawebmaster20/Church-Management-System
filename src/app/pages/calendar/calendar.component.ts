import { Component, OnInit, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi, Calendar } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { ApiService} from '../../core/services/api/api.service';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { category, calendarEvents, createEventId } from './data';

import Swal from 'sweetalert2';
import { catchError, concatMap, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, AfterViewInit {

  modalRef?: BsModalRef;

  // bread crumb items
  breadCrumbItems: Array<{}>;

  @ViewChild('modalShow') modalShow: TemplateRef<any>;
  @ViewChild('editmodalShow') editmodalShow: TemplateRef<any>;
  @ViewChild('fullcalendar') fullcalendar!: FullCalendarComponent;

  formEditData: UntypedFormGroup;
  submitted = false;
  category: any[];
  newEventDate: any;
  editEvent: any;
  calendarEvents: any[];
  // event form
  formData: UntypedFormGroup;

  calendarOptions: CalendarOptions = {
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'dayGridMonth,dayGridWeek,dayGridDay',
      center: 'title',
      right: 'prevYear,prev,next,nextYear'
    },
    initialView: "dayGridMonth",
    themeSystem: "bootstrap",
    initialEvents: [],
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    dateClick: this.openModal.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    eventTimeFormat: { // like '14:30:00'
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: true
    }
  };
  currentEvents: EventApi[] = [];

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Skote' }, { label: 'Calendar', active: true }];

    this.formData = this.formBuilder.group({
      title: ['', [Validators.required]],
      category: ['', [Validators.required]],
    });

    this.formEditData = this.formBuilder.group({
      editTitle: ['', [Validators.required]],
      editCategory: [],
    });
    
  }
  
  ngAfterViewInit(): void {
    this._fetchData();
    
  }

  /**
   * Event click modal show
   */
  handleEventClick(clickInfo: EventClickArg) {
    this.editEvent = clickInfo.event;
    var category = clickInfo.event.classNames;
    this.formEditData = this.formBuilder.group({
      editTitle: clickInfo.event.title,
      editCategory: category instanceof Array?clickInfo.event.classNames[0]:clickInfo.event.classNames,
    });
    this.modalRef = this.modalService.show(this.editmodalShow);
  }

  /**
   * Events bind in calander
   * @param events events
   */
  handleEvents(events: EventApi[]) {
    this.currentEvents = events;
  
  }

  private destroy$ = new Subject()
  constructor(
    private modalService: BsModalService,
    private api: ApiService,
    private formBuilder: UntypedFormBuilder
  ) {}

  get form() {
    return this.formData.controls;
  }

  /**
   * Delete-confirm
   */
  confirm() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#34c38f',
      cancelButtonColor: '#f46a6a',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.value) {
        this.deleteEventData();
        Swal.fire('Deleted!', 'Event has been deleted.', 'success');
      }
    });
  }

  position() {
    Swal.fire({
      position: 'center',
      icon: 'success',
      title: 'Event has been saved',
      showConfirmButton: false,
      timer: 1000,
    });
  }

  /**
   * Event add modal
   */
  openModal(event?: any) {
    console.log('Modal open', event);
    this.newEventDate = event;
    this.modalRef = this.modalService.show(this.modalShow);
  }

  /**
   * save edit event data
   */
  editEventSave() {
    const editTitle = this.formEditData.get('editTitle').value;
    const editCategory = this.formEditData.get('editCategory').value;

    const editId = this.calendarEvents.findIndex(
      (x) => x.id + '' === this.editEvent.id + ''
    );

    const event = {
      title: editTitle,
      id: Number(this.editEvent.id),
      className: editCategory + ' ' + 'text-white',
    }
    const calendarApi: Calendar = this.fullcalendar.getApi();


    this.api.updateEvent(event)
    .pipe(
      take(1),
      concatMap((data) => {
        // console.log('Event MODIFIED', data);
        this.position();
        return this.api.getEvents(); 
      })
  )
  .subscribe({
      next: (data) =>{
        calendarApi.removeAllEvents();
        this.calendarEvents = data;
        data.forEach((event) =>{
          calendarApi.addEvent(event)
        })
      },
      error: (err)=> console.log(err)
    })


    this.position();
    this.formEditData = this.formBuilder.group({
      editTitle: '',
      editCategory: '',
    });
    this.modalService.hide();
  }

  /**
   * Delete event
   */
  deleteEventData() {
    this.api.deleteEvent(this.editEvent.id) 
    .pipe(
      take(1),
      concatMap((data) => {
        // console.log('Event deleted', data);
        this.position();
        return this.api.getEvents(); 
      })
    )
    .subscribe({
      next: (data) => {
        this.calendarEvents = []
        this.calendarEvents = data;
        const eventToDelete = this.currentEvents.find(event => event.id === this.editEvent.id);
        if (eventToDelete) {
          eventToDelete.remove();
        }
      },
      error: (err) => {
        console.log('Error deleting event', err);
        Swal.fire('Error!', 'There was an error deleting the event.', 'error');
      }
    });
  this.modalService.hide();
  }

  /**
   * Close event modal
   */
  closeEventModal() {
    this.formData = this.formBuilder.group({
      title: '',
      category: '',
    });
    this.modalService.hide();
  }

  /**
   * Save the event
   */
  saveEvent() {
    if (this.formData.valid) {
      const title = this.formData.get('title').value;
      const className = this.formData.get('category').value;
      const calendarApi = this.newEventDate.view.calendar;
      const event = {
          title,
          start: this.newEventDate.date.getTime(),
          end: this.newEventDate.date.getTime(),
          className: className + ' ' + 'text-white'
        }
        this.api.addNewEvent(event)
        .pipe(
          take(1), 
          concatMap((data) => {
            // data saved success
            // console.log( data);
            this.position();
    
            //  events
            return this.api.getEvents(); 
          })
        )
        .subscribe({
          next: (data) =>{
            calendarApi.removeAllEvents();
            this.calendarEvents = data;
            data.forEach((event) =>{
              calendarApi.addEvent(event)
            })
          },
          error: (err)=> console.log(err)
        })
      this.formData = this.formBuilder.group({
        title: '',
        category: '',
      });
      this.modalService.hide();
    }
    this.submitted = true;
  }

  /**
   * Fetches the data
   */
  private _fetchData() {
    // Event category
    this.category = category;
    // Calender Event Data
    const calendarApi: Calendar = this.fullcalendar.getApi();
    this.api.getEvents().pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) =>{
        this.calendarEvents = data;
        data.forEach((event) =>{
          calendarApi.addEvent(event)
        })
        // this.calendarEvents = data
      },
      error: (err: any) => console.log(err)
    });
    // form submit
    this.submitted = false;
  }


}
