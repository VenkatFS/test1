// Sample usage example for DynamicFormComponent (Standalone Form)

import { Component } from '@angular/core';
import { ColumnDefinition } from './dynamic-form.component';

@Component({
  selector: 'app-example',
  template: `
    <div class="page-container">
      <div class="button-group">
        <button mat-button (click)="setAddMode()">Add New Record</button>
        <button mat-button (click)="setEditMode()">Edit Record</button>
      </div>
      
      <app-dynamic-form
        [columns]="columns"
        [data]="currentData"
        [title]="formTitle"
        [isEditMode]="isEditMode"
        (save)="onSave($event)"
        (cancel)="onCancel()">
      </app-dynamic-form>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 20px;
    }
    .button-group {
      margin-bottom: 20px;
    }
    .button-group button {
      margin-right: 10px;
    }
  `]
})
export class ExampleComponent {
  
  // Sample column definitions based on your image
  columns: ColumnDefinition[] = [
    { field: 'id', headerName: 'ID', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'endpoint_id', headerName: 'Endpoint ID', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'model_params.temperature', headerName: 'Temperature', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'model_params.max_tokens', headerName: 'Max Tokens', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'model_params.top_k', headerName: 'Top K', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'model_params.top_p', headerName: 'Top P', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'model_params.repetition_penalty', headerName: 'Repetition Penalty', sortable: true, filter: 'agNumberColumnFilter' },
    { field: 'model_params.do_sample', headerName: 'Do Sample', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'model_params.stream', headerName: 'Stream', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'agent_name', headerName: 'Agent Name', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'agent_node', headerName: 'Agent Node', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'created_by', headerName: 'Created By', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'updated_by', headerName: 'Updated By', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'created_at', headerName: 'Created At', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'updated_at', headerName: 'Updated At', sortable: true, filter: 'agTextColumnFilter' },
    { field: 'is_active', headerName: 'Is Active', sortable: true, filter: 'agTextColumnFilter' }
  ];

  // Sample data for editing
  sampleData = {
    id: 1,
    endpoint_id: 'endpoint-123',
    model_params: {
      temperature: 0.7,
      max_tokens: 1000,
      top_k: 50,
      top_p: 0.9,
      repetition_penalty: 1.1,
      do_sample: true,
      stream: false
    },
    agent_name: 'My Agent',
    agent_node: 'node-1',
    created_by: 'admin',
    updated_by: 'admin',
    created_at: new Date(),
    updated_at: new Date(),
    is_active: true
  };

  currentData: any = {};
  formTitle: string = 'Add New Record';
  isEditMode: boolean = false;

  // Set form to add mode (empty data)
  setAddMode(): void {
    this.currentData = {}; // Empty object for add mode
    this.formTitle = 'Add New Record';
    this.isEditMode = false;
  }

  // Set form to edit mode (with existing data)
  setEditMode(): void {
    this.currentData = { ...this.sampleData }; // Copy existing data for edit mode
    this.formTitle = 'Edit Record';
    this.isEditMode = true;
  }

  // Handle save event
  onSave(data: any): void {
    console.log('Form data saved:', data);
    
    if (this.isEditMode) {
      console.log('Updating existing record:', data);
      // Handle update logic here
      // Example: this.dataService.updateRecord(data);
    } else {
      console.log('Creating new record:', data);
      // Handle create logic here
      // Example: this.dataService.createRecord(data);
    }
    
    // Reset form after successful save
    this.setAddMode();
  }

  // Handle cancel event
  onCancel(): void {
    console.log('Form cancelled');
    // Reset form to add mode
    this.setAddMode();
  }
}
