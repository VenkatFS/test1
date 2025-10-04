import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

export interface ColumnDefinition {
  field: string;
  headerName: string;
  sortable: boolean;
  filter: string;
  valueGetter?: (params: any) => any;
}

export interface FormFieldConfig {
  field: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'email';
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
}

@Component({
  selector: 'app-dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any = {};
  @Input() title: string = 'Form';
  @Input() isEditMode: boolean = false;
  
  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  formFields: FormFieldConfig[] = [];

  constructor(
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({});
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['data']) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    this.formFields = this.generateFormFields();
    this.buildForm();
  }

  private generateFormFields(): FormFieldConfig[] {
    return this.columns.map(col => {
      const fieldType = this.getFieldType(col);
      const isRequired = this.isFieldRequired(col.field);
      
      return {
        field: col.field,
        label: col.headerName,
        type: fieldType,
        required: isRequired,
        disabled: this.isFieldDisabled(col.field),
        placeholder: `Enter ${col.headerName.toLowerCase()}`,
        ...this.getFieldConstraints(col.field, fieldType)
      };
    });
  }

  private getFieldType(column: ColumnDefinition): 'text' | 'number' | 'boolean' | 'date' | 'email' {
    const field = column.field.toLowerCase();
    
    // Date fields
    if (field.includes('date') || field.includes('created_at') || field.includes('updated_at')) {
      return 'date';
    }
    
    // Email fields
    if (field.includes('email')) {
      return 'email';
    }
    
    // Boolean fields
    if (field.includes('is_') || field.includes('do_') || field.includes('stream')) {
      return 'boolean';
    }
    
    // Number fields
    if (column.filter === 'agNumberColumnFilter' || 
        field.includes('id') || 
        field.includes('temperature') || 
        field.includes('tokens') || 
        field.includes('top_') || 
        field.includes('penalty')) {
      return 'number';
    }
    
    return 'text';
  }

  private isFieldRequired(field: string): boolean {
    const requiredFields = ['id', 'endpoint_id', 'agent_name', 'created_by'];
    return requiredFields.includes(field);
  }

  private isFieldDisabled(field: string): boolean {
    const disabledFields = ['id', 'created_at', 'updated_at', 'created_by', 'updated_by'];
    return disabledFields.includes(field);
  }

  private getFieldConstraints(field: string, type: string): any {
    const constraints: any = {};
    
    if (type === 'number') {
      if (field.includes('temperature')) {
        constraints.min = 0;
        constraints.max = 2;
      } else if (field.includes('tokens')) {
        constraints.min = 1;
        constraints.max = 4096;
      } else if (field.includes('top_')) {
        constraints.min = 0;
        constraints.max = 1;
      } else if (field.includes('penalty')) {
        constraints.min = 0;
        constraints.max = 2;
      }
    }
    
    return constraints;
  }

  private buildForm(): void {
    const formControls: { [key: string]: FormControl } = {};
    
    this.formFields.forEach(field => {
      const value = this.getFieldValue(field.field);
      const validators = this.getValidators(field);
      
      formControls[field.field] = new FormControl({
        value: value,
        disabled: field.disabled
      }, validators);
    });
    
    this.form = this.fb.group(formControls);
  }

  private getFieldValue(field: string): any {
    // Handle nested fields like model_params.temperature
    if (field.includes('.')) {
      const parts = field.split('.');
      let value = this.data;
      for (const part of parts) {
        value = value?.[part];
      }
      return value || this.getDefaultValue(field);
    }
    
    return this.data[field] || this.getDefaultValue(field);
  }

  private getDefaultValue(field: string): any {
    const fieldType = this.getFieldType({ field, headerName: '', sortable: true, filter: '' });
    
    switch (fieldType) {
      case 'number': return 0;
      case 'boolean': return false;
      case 'date': return new Date();
      case 'email': return '';
      default: return '';
    }
  }

  private getValidators(field: FormFieldConfig): any[] {
    const validators = [];
    
    if (field.required) {
      validators.push(Validators.required);
    }
    
    if (field.type === 'email') {
      validators.push(Validators.email);
    }
    
    if (field.type === 'number') {
      validators.push(Validators.pattern(/^\d+(\.\d+)?$/));
      
      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }
      
      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }
    }
    
    return validators;
  }

  onSave(): void {
    if (this.form.valid) {
      const formData = this.prepareFormData();
      this.save.emit(formData);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  private prepareFormData(): any {
    const formValue = this.form.getRawValue();
    const result: any = {};
    
    // Handle nested fields
    Object.keys(formValue).forEach(key => {
      if (key.includes('.')) {
        const parts = key.split('.');
        let current = result;
        
        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        
        current[parts[parts.length - 1]] = formValue[key];
      } else {
        result[key] = formValue[key];
      }
    });
    
    return result;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(field: string): string {
    const control = this.form.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldLabel(field)} is required`;
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (control.errors['min']) {
        return `Minimum value is ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `Maximum value is ${control.errors['max'].max}`;
      }
      if (control.errors['pattern']) {
        return 'Please enter a valid number';
      }
    }
    return '';
  }

  private getFieldLabel(field: string): string {
    const formField = this.formFields.find(f => f.field === field);
    return formField?.label || field;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }
}
