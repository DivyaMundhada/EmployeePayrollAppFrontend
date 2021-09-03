import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from 'src/app/model/employee';
import { DataService } from 'src/app/service/data.service';
import { HttpService } from 'src/app/service/http.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {

  public employee: Employee = new Employee;
  public employeeFormGroup: FormGroup = new FormGroup({});
  minDate: Date;
  maxDate: Date;

  departments: any = [
    {
      name: "HR",
      value: "HR",
      checked: false
    }, {
      name: "Sales",
      value: "Sales",
      checked: false
    }, {
      name: "Finance",
      value: "Finance",
      checked: false
    }, {
      name: "Engineer",
      value: "Engineer",
      checked: false
    }, {
      name: "Other",
      value: "Other",
      checked: false
    }
  ]
  constructor(
    private formBuilder: FormBuilder,
    private httpService: HttpService,
    private dataService: DataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar) {

    this.employeeFormGroup = this.formBuilder.group({
      name: new FormControl('',[Validators.required, Validators.pattern("^[A-Z]{1}[a-zA-Z\s]{2,}$")]),
      profilePic: new FormControl('',Validators.required),
      gender: new FormControl('',Validators.required),
      department: this.formBuilder.array([], [Validators.required]),
      salary: new FormControl('',Validators.required),
      createdDate: new FormControl('',Validators.required),
      note: new FormControl('',Validators.required)
    })
    const currentYear = new Date().getFullYear();
    this.minDate = new Date(currentYear - 0,0,1);
    this.maxDate = new Date();
  }

  onCheckboxChange(event: MatCheckboxChange) {
    const department: FormArray = this.employeeFormGroup.get('department') as FormArray;

    if (event.checked) {
      department.push(new FormControl(event.source.value));
    } else {
      const index = department.controls.findIndex(x => x.value === event.source.value);
      department.removeAt(index);
    }
  }

  salary: number = 400000;
  updateSetting(event: any) {
    this.salary = event.value;
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.dataService.currentEmployee.subscribe(employee => {
        if (Object.keys(employee).length !== 0) {
          console.log(employee);
          this.employeeFormGroup.get('name')?.setValue(employee.name);
          this.employeeFormGroup.get('profilePic')?.setValue(employee.profilePic);
          this.employeeFormGroup.get('gender')?.setValue(employee.gender);
          this.employeeFormGroup.get('salary')?.setValue(employee.salary);
          this.employeeFormGroup.get('createdDate')?.setValue(employee.createdDate);
          this.employeeFormGroup.get('note')?.setValue(employee.note);
          const department: FormArray = this.employeeFormGroup.get('department') as FormArray;
          employee.department.forEach(departmentElement => {
            for (let index = 0; index < this.departments.length; index++) {
              if (this.departments[index].name === departmentElement) {
                this.departments[index].checked = true;
                department.push(new FormControl(this.departments[index].value));
              }
            }
          })
        }
      });
    }
  }


  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    return value;
  }
  onSubmit(): void {
    this.employee = this.employeeFormGroup.value;
    if (this.activatedRoute.snapshot.params['id'] != undefined) {
      this.httpService.updateEmployeeData(this.activatedRoute.snapshot.params['id'],this.employee).subscribe(response => {
        console.log(response);
        this.router.navigateByUrl('/home');
        this.snackBar.open("Form Updated Successfully","Updated",{duration:3000});
      });
    }
    else {
      this.httpService.addEmployeeData(this.employee).subscribe(response => {
        console.log(response);
        this.router.navigateByUrl('/home');
        this.snackBar.open("Form Submitted Successfully","Submitted",{duration:3000});
      });
    }
  }
}