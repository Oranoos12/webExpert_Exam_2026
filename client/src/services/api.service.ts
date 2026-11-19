import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl;

// Haalt de foutmelding van onze server uit een HTTP-fout.
function getErrorMessage(error: any, fallback: string): string {
  if (error instanceof HttpErrorResponse && error.error && error.error.error) {
    return error.error.error.message;
  }
  return fallback;
}

// Eén service voor alle requests naar de API.
// providedIn: 'root' -> er is maar één ApiService voor de hele app.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // de ingelogde gebruiker: { _id, username, role } of {} als niemand ingelogd is
  user: any = {};
  loginChecked = false;

  // Eén request naar de API.
  // withCredentials: true -> de browser stuurt de cookies met de tokens mee.
  private call(method: string, path: string, body: any): Promise<any> {
    return firstValueFrom(this.http.request(method, `${API_URL}${path}`, { body: body, withCredentials: true }));
  }

  // Een request voor een beveiligde route.
  // Is het access token verlopen (401)? Dan vragen we één keer een nieuw
  // access token met het refresh token, en proberen we opnieuw.
  private async send(method: string, path: string, body: any): Promise<any> {
    try {
      return await this.call(method, path, body);
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        await this.call('POST', '/security/refresh', {});
        return await this.call(method, path, body);
      }
      throw error;
    }
  }

  async login(username: string, password: string): Promise<void> {
    try {
      const body = { username: username, password: password };
      this.user = await this.call('POST', '/security/login', body);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    }
  }

  async logout(): Promise<void> {
    try {
      await this.call('POST', '/security/logout', {});
    } finally {
      this.user = {};
    }
  }

  // Is er nog een geldige cookie? (bv. na het herladen van de pagina)
  async checkLogin(): Promise<void> {
    try {
      this.user = await this.send('POST', '/security/login/check', {});
    } catch (error) {
      this.user = {};
    } finally {
      this.loginChecked = true;
    }
  }

  async getUpcomingMatches(): Promise<any[]> {
    try {
      return await this.send('GET', '/matches?status=upcoming', null);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not load matches'));
    }
  }

  async getTeams(): Promise<any[]> {
    try {
      return await this.send('GET', '/teams', null);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not load teams'));
    }
  }

  async getPredictions(): Promise<any[]> {
    try {
      return await this.send('GET', '/player/predictions', null);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not load predictions'));
    }
  }

  async getRanking(): Promise<any> {
    try {
      return await this.send('GET', '/player/ranking', null);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not load ranking'));
    }
  }

  async placePrediction(matchId: string, homeScore: number, awayScore: number): Promise<void> {
    try {
      const body = { homeScore: homeScore, awayScore: awayScore };
      await this.send('POST', `/matches/${matchId}/predictions`, body);
    } catch (error) {
      throw new Error(getErrorMessage(error, 'Could not save prediction'));
    }
  }
}