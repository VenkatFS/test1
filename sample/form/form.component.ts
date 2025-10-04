import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    DropdownModule,
    CalendarModule
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  @Input() data: any = {};
  @Input() isVisible: boolean = false;
  @Output() onSave = new EventEmitter<any>();
  @Output() onCancel = new EventEmitter<void>();

  form: FormGroup;
  isEditMode: boolean = false;

  const selectedRecord = {
  id: "12345",
  endpoint_id: "endpoint-001",
  model_params: {
    temperature: 0.7,
    max_tokens: 1500,
    top_k: 50,
    top_p: 0.9,
    repetition_penalty: 1.1,
    do_sample: true,
    stream: false
  },
  agent_name: "Customer Support Agent",
  agent_node: "node-001",
  created_by: "admin@company.com",
  updated_by: "user@company.com",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-01-20T14:45:00Z",
  is_active: true
};

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({});
  }

  

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    // Check if data is empty to determine add vs edit mode
    this.isEditMode = this.data && Object.keys(this.data).length > 0;

    this.form = this.fb.group({
      id: [this.data?.id || ''],
      endpoint_id: [this.data?.endpoint_id || '', Validators.required],
      'model_params.temperature': [this.data?.['model_params']?.temperature || 0.7, [Validators.min(0), Validators.max(2)]],
      'model_params.max_tokens': [this.data?.['model_params']?.max_tokens || 1000, [Validators.min(1), Validators.max(4000)]],
      'model_params.top_k': [this.data?.['model_params']?.top_k || 50, [Validators.min(1), Validators.max(100)]],
      'model_params.top_p': [this.data?.['model_params']?.top_p || 0.9, [Validators.min(0), Validators.max(1)]],
      'model_params.repetition_penalty': [this.data?.['model_params']?.repetition_penalty || 1.0, [Validators.min(0.1), Validators.max(2.0)]],
      'model_params.do_sample': [this.data?.['model_params']?.do_sample || false],
      'model_params.stream': [this.data?.['model_params']?.stream || false],
      agent_name: [this.data?.agent_name || '', Validators.required],
      agent_node: [this.data?.agent_node || '', Validators.required],
      created_by: [this.data?.created_by || ''],
      updated_by: [this.data?.updated_by || ''],
      created_at: [this.data?.created_at ? new Date(this.data.created_at) : null],
      updated_at: [this.data?.updated_at ? new Date(this.data.updated_at) : null],
      is_active: [this.data?.is_active !== undefined ? this.data.is_active : true]
    });

    // Disable certain fields in edit mode
    if (this.isEditMode) {
      this.form.get('id')?.disable();
      this.form.get('created_by')?.disable();
      this.form.get('created_at')?.disable();
    }
  }

  onSaveClick(): void {
    if (this.form.valid) {
      const formData = this.form.getRawValue();
      
      // Transform flat form data back to nested structure
      const transformedData = {
        id: formData.id,
        endpoint_id: formData.endpoint_id,
        model_params: {
          temperature: formData['model_params.temperature'],
          max_tokens: formData['model_params.max_tokens'],
          top_k: formData['model_params.top_k'],
          top_p: formData['model_params.top_p'],
          repetition_penalty: formData['model_params.repetition_penalty'],
          do_sample: formData['model_params.do_sample'],
          stream: formData['model_params.stream']
        },
        agent_name: formData.agent_name,
        agent_node: formData.agent_node,
        created_by: formData.created_by,
        updated_by: formData.updated_by,
        created_at: formData.created_at,
        updated_at: formData.updated_at,
        is_active: formData.is_active
      };

      this.onSave.emit(transformedData);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach(key => {
        this.form.get(key)?.markAsTouched();
      });
    }
  }

  onCancelClick(): void {
    this.form.reset();
    this.onCancel.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (field.errors['min']) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}`;
      if (field.errors['max']) return `${this.getFieldLabel(fieldName)} must be at most ${field.errors['max'].max}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'endpoint_id': 'Endpoint ID',
      'model_params.temperature': 'Temperature',
      'model_params.max_tokens': 'Max Tokens',
      'model_params.top_k': 'Top K',
      'model_params.top_p': 'Top P',
      'model_params.repetition_penalty': 'Repetition Penalty',
      'model_params.do_sample': 'Do Sample',
      'model_params.stream': 'Stream',
      'agent_name': 'Agent Name',
      'agent_node': 'Agent Node',
      'created_by': 'Created By',
      'updated_by': 'Updated By',
      'created_at': 'Created At',
      'updated_at': 'Updated At',
      'is_active': 'Is Active'
    };
    return labels[fieldName] || fieldName;
  }
}
