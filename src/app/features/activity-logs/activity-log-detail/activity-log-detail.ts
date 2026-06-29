import { JsonPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ActivityLog } from '../../../core/models/activity-log.model';
import { ActivityLogService } from '../activity-log.service';

@Component({
  selector: 'app-activity-log-detail',
  imports: [JsonPipe],
  templateUrl: './activity-log-detail.html',
  styleUrl: './activity-log-detail.scss'
})
export class ActivityLogDetail implements OnInit {
  private readonly activityLogService = inject(ActivityLogService);
  private readonly route = inject(ActivatedRoute);
  readonly log = signal<ActivityLog | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.activityLogService.detail({ id }).subscribe((log) => this.log.set(log));
    }
  }
}
