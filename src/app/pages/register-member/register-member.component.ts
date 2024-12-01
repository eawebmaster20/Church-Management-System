import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, UntypedFormGroup } from '@angular/forms';
import { MustMatch } from './validation.mustmatch';
import { ApiService } from 'src/app/core/services/api/api.service';
import { concatMap, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-register-member',
  templateUrl: './register-member.component.html',
  styleUrls: ['./register-member.component.scss']
})
export class RegisterMemberComponent {

  validationform: UntypedFormGroup; // bootstrap validation form
  tooltipvalidationform: UntypedFormGroup; // bootstrap tooltip validation form
  typeValidationForm: UntypedFormGroup; // type validation form
  rangeValidationForm: UntypedFormGroup; // range validation form

  constructor(public formBuilder: UntypedFormBuilder, private api:ApiService) { }
  // bread crumb items
  breadCrumbItems: Array<{}>;
  // Form submition
  submit: boolean;
  formsubmit: boolean;
  typesubmit: boolean;
  rangesubmit: boolean;

  members: any;

  ngOnInit() {
    this.breadCrumbItems = [{ label: 'Forms' }, { label: 'Form Validation', active: true }];
    this.api.getMembers()
    .pipe(take(1))
    .subscribe(members=> {
      this.members = members;
      // console.log(this.members )
    }
    );
    this.buildMemberForm();
  }

  buildMemberForm() {
    this.validationform = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      lastName: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
      dateOfBirth: [new Date(), [Validators.required]],
      homeAddress: ['koforidua', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('[0-9]+')]],
      email: ['', [Validators.required, Validators.email]],
      haveChildren: [false, [Validators.required]],
      childredIds: [],
      childrenIsMember: [false],
      maritalStatus: [false],
      spouseId: [],
      spouseIsMember: [false],
    });
  }
  /**
   * Returns form
   */
  get form() {
    return this.validationform.controls;
  }

  /**
   * Bootsrap validation form submit method
   */
  validSubmit() {
    this.submit = true;
    // console.log(this.validationform.value);
    if (!this.validationform.valid) return;
    this.api.registerMember(this.validationform.value)
    .pipe(
      take(1),
      concatMap((data) => {
        // console.log('Event MODIFIED', data);
        return this.api.getMembers(); 
      })
    )
    .subscribe({
       next: (response) => {
        //  console.log(response);

        this.submit = false;
        this.validationform.reset();
       },
       error: (error) => {
         console.log(error);
       }
    })
  }

  /**
   * returns tooltip validation form
   */
  get formData() {
    return this.tooltipvalidationform.controls;
  }

  /**
   * Bootstrap tooltip form validation submit method
   */
  formSubmit() {
    this.formsubmit = true;
  }

  /**
   * Returns the type validation form
   */
  get type() {
    return this.typeValidationForm.controls;
  }

  /**
   * Type validation form submit data
   */
  typeSubmit() {
    this.typesubmit = true;
  }

  /**
   * Returns the range validation form
   */
  get range() {
    return this.rangeValidationForm.controls;
  }

  /**
   * range validation submit data
   */
  rangeSubmit() {
    this.rangesubmit = true;
  }
}
