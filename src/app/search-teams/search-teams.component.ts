import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TeamSearchResultViewModel } from "../team-search-result-view-model";
import { SearchTeamsServiceService } from "../search-teams-service.service";
import { NewGameSetupViewModel } from "../new-game-setup-view-model";

@Component({
  selector: "app-search-teams",
  templateUrl: "./search-teams.component.html",
  styleUrls: ["./search-teams.component.scss"],
})
export class SearchTeamsComponent implements OnInit {
  GameSetup: NewGameSetupViewModel;
  SearchableSeasons: number[] = new Array<number>();
  SearchingHomeTeams: boolean;
  SearchingAwayTeams: boolean;
  constructor(
    private router: Router,
    private searchTeamsService: SearchTeamsServiceService
  ) {
    this.GameSetup = new NewGameSetupViewModel();
    this.GameSetup.League = "mlb";
    let today = new Date();
    for (let i: number = today.getFullYear() - 1; i > 1875; i--) {
      this.SearchableSeasons.push(i);
    }
  }

  ngOnInit() {}

  setupNewSinglePlayerGame() {
    this.router.navigateByUrl("searchteams");
  }

  SetLineups() {
    let newGameId = new Date().getTime() * 10000 + 621355968000000000;
    localStorage.setItem(
      "game_setup_" + newGameId,
      JSON.stringify(this.GameSetup)
    );

    this.router.navigateByUrl("/setlineups/" + newGameId);
  }

  setDH() {
    this.GameSetup.IsDesignatedHitterEnabled =
      !this.GameSetup.IsDesignatedHitterEnabled;
  }

  HomeSearchResults: TeamSearchResultViewModel[] =
    new Array<TeamSearchResultViewModel>();

  AwaySearchResults: TeamSearchResultViewModel[] =
    new Array<TeamSearchResultViewModel>();

    SelectedHomeYear: number = undefined;
    SelectedAwayYear: number = undefined;

  SearchTeams(isHomeTeam: boolean, year: number) {
    if (isHomeTeam) {
      this.SearchingHomeTeams = true;
      this.HomeSearchResults = [];
      this.SelectedHomeYear = undefined;
      if (year != -1) {
        this.searchTeamsService
          .GetTeamsBySeason(this.GameSetup.League, year)
          .subscribe((results) => {
            this.HomeSearchResults = results;
            this.SearchingHomeTeams = false;
            this.SelectedHomeYear = year;
          });
      }
      else{
        this.SearchingHomeTeams = false;
      }
    } else {
      this.SearchingAwayTeams = true;
      this.AwaySearchResults = [];
      this.SelectedAwayYear = undefined;
      if (year != -1) {
      this.searchTeamsService
        .GetTeamsBySeason(this.GameSetup.League, year)
        .subscribe((results) => {
          this.AwaySearchResults = results;
          this.SearchingAwayTeams = false;
          this.SelectedAwayYear = year;
        });
      }
      else{
        this.SearchingAwayTeams = false;
      }
    }
  }

  SetRandomTeamYear(isHomeTeam = false){
    const d = new Date();
    let lastYear = d.getFullYear() - 1;
    let year = Math.floor(Math.random() * (lastYear - 1876) + 1876);
    this.SearchTeams(isHomeTeam, year)
  }

  SetHomeTeamSelection(selection: TeamSearchResultViewModel) {
    this.GameSetup.SetHomeTeamSelection(selection);

    if (this.GameSetup.AwayTeamSelection) {
      this.scrollToTop();
    }
  }

  SetAwayTeamSelection(selection: TeamSearchResultViewModel) {
    this.GameSetup.AwayTeamSelection = selection;
    if (this.GameSetup.HomeTeamSelection) {
      this.scrollToTop();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
