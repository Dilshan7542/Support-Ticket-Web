import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ActivityLogsStore } from '../state/activity-logs.store';

@Component({
  selector: 'app-activity-log-list',
  imports: [RouterLink],
  templateUrl: './activity-log-list.html',
  styleUrl: './activity-log-list.scss'
})
export class ActivityLogList implements OnInit {
  readonly store = inject(ActivityLogsStore);

  ngOnInit(): void {
    this.store.loadLogs();
  }
}
