import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../tickets/ticket.service';
import { DashboardStore } from '../state/dashboard.store';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  private readonly ticketService = inject(TicketService);
  readonly store = inject(DashboardStore);

  readonly tickets = signal<Ticket[]>([]);
  readonly projectFocus =
    'A web-based support ticket system that uses Natural Language Processing and Machine Learning to classify customer complaints, predict priority, and route tickets to the correct department.';
  readonly proposalHighlights = [
    'Customer complaints are currently sorted manually, which can delay responses and create wrong department assignments.',
    'The proposed system analyses complaint text and suggests category, priority, department, urgency, and a reply template.',
    'The AI module uses traditional NLP and supervised machine learning instead of an external LLM as the main intelligence.',
    'Support agents keep the final decision, while the system provides decision support and faster ticket organisation.'
  ];
  readonly objectives = [
    'Design a web-based support ticket management system for customers, support agents, and administrators.',
    'Develop an NLP preprocessing pipeline for customer complaint messages.',
    'Train and test a machine learning model for ticket category classification.',
    'Predict ticket priority levels such as Low, Medium, High, and Critical.',
    'Map predicted categories to suitable support departments.',
    'Provide template-based suggested replies for support agents.',
    'Evaluate the AI model using accuracy, precision, recall, F1-score, and confusion matrix.'
  ];
  readonly aiWorkflow = [
    { step: 'Input', detail: 'Customer enters a complaint message.' },
    { step: 'Preprocessing', detail: 'Text is cleaned, lowercased, tokenised, and filtered.' },
    { step: 'Feature Extraction', detail: 'TF-IDF converts cleaned text into numerical features.' },
    { step: 'Prediction', detail: 'A machine learning model predicts category and priority.' },
    { step: 'Decision Support', detail: 'The system assigns a department and displays a suggested reply.' }
  ];
  readonly modules = [
    { name: 'Customer Module', detail: 'Submit tickets, view status, replies, and ticket history.' },
    { name: 'Support Agent Module', detail: 'View assigned tickets, check AI predictions, update status, reply, and close tickets.' },
    { name: 'Admin Module', detail: 'Manage users, agents, departments, categories, priority rules, and dashboard reports.' },
    { name: 'AI Module', detail: 'Preprocess text, classify category, predict priority, detect urgency, and suggest reply templates.' }
  ];
  readonly categoryRouting = [
    { category: 'Payment Issue', department: 'Finance / Payment Support' },
    { category: 'Login Issue', department: 'Technical Support' },
    { category: 'Refund Issue', department: 'Customer Care / Finance' },
    { category: 'Delivery Issue', department: 'Operations Team' },
    { category: 'Account Issue', department: 'Account Support' },
    { category: 'General Inquiry', department: 'Customer Support' }
  ];
  readonly timeline = [
    { week: '1-2', activity: 'Topic confirmation, initial research, proposal writing, and supervisor feedback.' },
    { week: '3-4', activity: 'Literature review, requirement analysis, SRS preparation, and system design.' },
    { week: '5-6', activity: 'Dataset preparation, AI preprocessing, model training, and evaluation.' },
    { week: '7-9', activity: 'Backend APIs, database, frontend interfaces, and AI service integration.' },
    { week: '10-12', activity: 'Testing, bug fixing, final report writing, review, and viva preparation.' }
  ];
  readonly total = computed(() => Number(this.store.summary()?.cardMetrics?.totalTickets ?? 0));
  readonly open = computed(() => Number(this.store.summary()?.cardMetrics?.openTickets ?? 0));
  readonly resolved = computed(() => Number(this.store.summary()?.cardMetrics?.resolvedTickets ?? 0));
  readonly closed = computed(() => Number(this.store.summary()?.cardMetrics?.closedTickets ?? 0));

  ngOnInit(): void {
    this.store.loadSummary();
    this.ticketService.list().subscribe((tickets) => this.tickets.set(tickets));
  }
}
