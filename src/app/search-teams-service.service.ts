import { Injectable } from '@angular/core';
import { TeamSearchResultViewModel } from './team-search-result-view-model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RosterSearchResultViewModel } from './roster-search-result-view-model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SearchTeamsServiceService {

  constructor(private http: HttpClient) { }

  GetTeamsBySeason(season: number): Observable<TeamSearchResultViewModel[]> {
    return this.http.get<TeamSearchResultViewModel[]>(environment.API_URL + "Team/mlb/" + season,
      {
        responseType: "json"
      }
    );
  }

  GetRosterBySeason(season: number, teamId: number): Observable<RosterSearchResultViewModel> {
    return this.http.get<RosterSearchResultViewModel>(environment.API_URL + "Team/mlb/" + season + "/" + teamId,
      {
        responseType: "json"
      }
    );
  }
}
