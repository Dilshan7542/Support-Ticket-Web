import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { distinctUntilChanged, finalize } from 'rxjs/operators';

import { TokenStorageService } from '../../../core/auth/token-storage.service';
import { Company } from '../../../core/models/company.model';
import { getApiErrorMessage } from '../../../core/models/api-response.model';
import { Department } from '../../../core/models/department.model';
import { TicketCategory } from '../../../core/models/ticket-category.model';
import { Ticket } from '../../../core/models/ticket.model';
import { CompanyService } from '../../companies/company.service';
import { DepartmentService } from '../../departments/department.service';
import { TicketCategoryService } from '../ticket-category.service';
import { TicketService } from '../ticket.service';

@Component({
  selector: 'app-ticket-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './ticket-create.html',
  styleUrl: './ticket-create.scss'
})
export class TicketCreate implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly companyService = inject(CompanyService);
  private readonly departmentService = inject(DepartmentService);
  private readonly ticketCategoryService = inject(TicketCategoryService);
  private readonly ticketService = inject(TicketService);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  loading = false;
  categoriesLoading = false;
  companiesLoading = false;
  departmentsLoading = false;
  categories: TicketCategory[] = [];
  companies: Company[] = [];
  departments: Department[] = [];
  createdTicket?: Ticket;
  error: string | null = null;
  categoriesError: string | null = null;
  companiesError: string | null = null;
  departmentsError: string | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    callerName: [''],
    callerContact: [''],
    companyId: [''],
    departmentId: [''],
    subject: ['', Validators.required],
    categoryCode: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.registerDropdownEvents();
    this.loadCompanies();
  }

  onCompanyChange(): void {
    this.form.controls.departmentId.setValue('', { emitEvent: false });
    this.form.controls.categoryCode.setValue('', { emitEvent: false });
    this.departments = [];
    this.categories = [];
    this.loadDepartments(true);
  }

  onDepartmentChange(): void {
    this.form.controls.categoryCode.setValue('', { emitEvent: false });
    this.categories = [];
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = null;

    const companyId = this.form.controls.companyId.value;
    const departmentId = this.form.controls.departmentId.value;

    this.ticketCategoryService.list({
      page: 0,
      size: 100,
      ...(companyId ? { companyId } : {}),
      ...(departmentId ? { departmentId } : {})
    }).pipe(
      finalize(() => {
        this.categoriesLoading = false;
        this.notifyView();
      })
    ).subscribe({
      next: (categories) => {
        this.categories = categories.filter((category) => {
          const isActive = category.status !== 'INACTIVE' && category.status !== 'DELETED';
          const belongsToSelectedCompany = !companyId || !category.companyId || String(category.companyId) === String(companyId);
          const belongsToSelectedDepartment = !departmentId || !category.departmentId || String(category.departmentId) === String(departmentId);

          return isActive && belongsToSelectedCompany && belongsToSelectedDepartment;
        });

        if (!this.form.controls.categoryCode.value && this.categories.length > 0) {
          this.form.controls.categoryCode.setValue(this.categories[0].code);
        }

        this.notifyView();
      },
      error: (error) => {
        this.categoriesError = getApiErrorMessage(error, 'Unable to load ticket categories');
        this.notifyView();
      }
    });
  }

  loadCompanies(): void {
    this.companiesLoading = true;
    this.companiesError = null;

    this.companyService.list().pipe(
      finalize(() => {
        this.companiesLoading = false;
        this.notifyView();
      })
    ).subscribe({
      next: (companies) => {
        this.companies = companies.filter((company) => company.status !== 'INACTIVE' && company.status !== 'DELETED');

        if (!this.form.controls.companyId.value && this.companies.length > 0) {
          this.form.controls.companyId.setValue(String(this.companies[0].id));
        } else {
          this.loadDepartments(true);
        }
        this.notifyView();
      },
      error: (error) => {
        this.companiesError = getApiErrorMessage(error, 'Unable to load companies');
        this.loadCategories();
        this.notifyView();
      }
    });
  }

  loadDepartments(selectFirst = false): void {
    this.departmentsLoading = true;
    this.departmentsError = null;

    const companyId = this.form.controls.companyId.value;

    this.departmentService.list(companyId ? { companyId } : {}).pipe(
      finalize(() => {
        this.departmentsLoading = false;
        this.notifyView();
      })
    ).subscribe({
      next: (departments) => {
        this.departments = departments.filter((department) => {
          const isActive = department.status !== 'INACTIVE' && department.status !== 'DELETED';
          const belongsToSelectedCompany = !companyId || String(department.companyId) === String(companyId);

          return isActive && belongsToSelectedCompany;
        });

        if (selectFirst && this.departments.length > 0) {
          this.form.controls.departmentId.setValue(String(this.departments[0].id), { emitEvent: false });
        }

        this.loadCategories();
        this.notifyView();
      },
      error: (error) => {
        this.departmentsError = getApiErrorMessage(error, 'Unable to load departments');
        this.loadCategories();
        this.notifyView();
      }
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      return;
    }

    const formValue = this.form.getRawValue();
    this.error = null;
    this.createdTicket = undefined;
    this.loading = true;

    this.ticketService.create({
      userId: this.tokenStorage.getUserId() ?? '',
      subject: formValue.subject,
      categoryCode: formValue.categoryCode,
      description: this.buildDescription(formValue)
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.notifyView();
      })
    ).subscribe({
      next: (ticket) => {
        this.createdTicket = ticket;
        this.form.reset({
          callerName: '',
          callerContact: '',
          companyId: '',
          departmentId: '',
          subject: '',
          categoryCode: this.categories[0]?.code ?? '',
          description: ''
        }, { emitEvent: false });
        this.loadDepartments(true);
        this.notifyView();
      },
      error: (error) => {
        this.error = getApiErrorMessage(error, 'Unable to create ticket');
        this.notifyView();
      }
    });
  }

  private buildDescription(formValue: {
    callerName: string;
    callerContact: string;
    companyId: string;
    departmentId: string;
    description: string;
  }): string {
    const company = this.companies.find((item) => String(item.id) === String(formValue.companyId));
    const department = this.departments.find((item) => String(item.id) === String(formValue.departmentId));
    const callerDetails = [
      formValue.callerName ? `Caller name: ${formValue.callerName}` : '',
      formValue.callerContact ? `Caller contact: ${formValue.callerContact}` : '',
      company ? `Company: ${company.name} (${company.code})` : '',
      department ? `Department: ${department.name}${department.code ? ` (${department.code})` : ''}` : ''
    ].filter(Boolean);

    return callerDetails.length
      ? `${callerDetails.join('\n')}\n\nComplaint:\n${formValue.description}`
      : formValue.description;
  }

  private notifyView(): void {
    this.changeDetectorRef.markForCheck();
  }

  private registerDropdownEvents(): void {
    this.form.controls.companyId.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.onCompanyChange());

    this.form.controls.departmentId.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.onDepartmentChange());
  }
}
