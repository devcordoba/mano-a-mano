import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { normalizarApiUrl } from './api-url';

@Injectable({ providedIn: 'root' })
export class ApiConfig {
  readonly http = inject(HttpClient);
  readonly apiUrl = normalizarApiUrl(environment.apiUrl);
}
