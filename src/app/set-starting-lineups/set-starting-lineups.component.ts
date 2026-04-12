import { Component, OnInit } from '@angular/core';
import { RosterSearchResultViewModel } from '../roster-search-result-view-model';
import { Router, ActivatedRoute } from '@angular/router';
import { SearchTeamsServiceService } from '../search-teams-service.service';
import { NewGameSetupViewModel } from '../new-game-setup-view-model';
import { GameViewModel } from '../game-view-model';
import { HitterPlayerSeasonViewModel } from '../hitter-player-season-view-model';
import { PitcherPlayerSeasonViewModel } from '../pitcher-player-season-view-model';
import { GamePlayerViewModel } from '../game-player-view-model';


@Component({
  selector: 'app-set-starting-lineups',
  templateUrl: './set-starting-lineups.component.html',
  styleUrls: ['./set-starting-lineups.component.scss']
})
export class SetStartingLineupsComponent implements OnInit {
  HomeTeamDataLoading: boolean;
  AwayTeamDataLoading: boolean;
  HomeTeamRoster: RosterSearchResultViewModel;
  AwayTeamRoster: RosterSearchResultViewModel;
  NewGameSetup: NewGameSetupViewModel;
  Game: GameViewModel;
  lineupNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  GameId: number;
  League: string;
  constructor(private router: Router, private searchTeamsService: SearchTeamsServiceService, activatedRoute: ActivatedRoute, game: GameViewModel) {

    this.HomeTeamRoster = null;

    this.GameId = activatedRoute.snapshot.params["newGameId"];
    const gameSetupData = localStorage.getItem('game_setup_' + this.GameId);
    if (!gameSetupData) {
      // Handle missing setup data, perhaps navigate back
      console.error('Game setup data not found');
      this.router.navigate(['/']); // or appropriate route
      return;
    }
    try {
      this.NewGameSetup = JSON.parse(gameSetupData) as NewGameSetupViewModel;
    } catch (error) {
      console.error('Error parsing game setup data', error);
      this.router.navigate(['/']); // or appropriate route
      return;
    }
    localStorage.clear();
    this.League = this.NewGameSetup.League;
    this.Game = game;
    this.Game.SetValues(this.GameId, this.NewGameSetup.HomeTeamSelection, this.NewGameSetup.AwayTeamSelection, this.NewGameSetup.IsDesignatedHitterEnabled);

    this.HomeTeamDataLoading = true;
    this.searchTeamsService.GetRosterBySeason(this.NewGameSetup.HomeTeamSelection.season,
      this.NewGameSetup.HomeTeamSelection.id, this.NewGameSetup.League, this.NewGameSetup.IsDesignatedHitterEnabled).subscribe({
        next: result => {
          this.HomeTeamRoster = result;
          this.HomeTeamDataLoading = false;
        },
        error: err => {
          console.error('Error loading home team roster', err);
          this.HomeTeamRoster = { hitters: [], pitchers: [], suggestedLineup: [], suggestedRotation: [] } as RosterSearchResultViewModel; // or handle appropriately
          this.HomeTeamDataLoading = false;
        }
      });

    this.AwayTeamDataLoading = true;
    this.searchTeamsService.GetRosterBySeason(this.NewGameSetup.AwayTeamSelection.season,
      this.NewGameSetup.AwayTeamSelection.id, this.NewGameSetup.League, this.NewGameSetup.IsDesignatedHitterEnabled).subscribe({
        next: result => {
          this.AwayTeamRoster = result;
          this.AwayTeamDataLoading = false;
        },
        error: err => {
          console.error('Error loading away team roster', err);
          this.AwayTeamRoster = { hitters: [], pitchers: [], suggestedLineup: [], suggestedRotation: [] } as RosterSearchResultViewModel; // or handle appropriately
          this.AwayTeamDataLoading = false;
        }
      });
  }

  setLineupPosition(pos: string, isHome: boolean, hitter: HitterPlayerSeasonViewModel, pitcher: PitcherPlayerSeasonViewModel) {

    if (isHome) {
      if (pos == "SP") {
        this.Game.HomeTeam.SetPitcher(new GamePlayerViewModel(pos, hitter, pitcher), this.Game.IsDesignatedHitterEnabled);
      }
      else if (pos == "C") {
        this.Game.HomeTeam.SetCatcher(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "1B") {
        this.Game.HomeTeam.SetFirstBase(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "2B") {
        this.Game.HomeTeam.SetSecondBase(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "SS") {
        this.Game.HomeTeam.SetShortstop(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "3B") {
        this.Game.HomeTeam.SetThirdBase(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "LF") {
        this.Game.HomeTeam.SetLeftField(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "CF") {
        this.Game.HomeTeam.SetCenterField(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "RF") {
        this.Game.HomeTeam.SetRightField(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (this.Game.IsDesignatedHitterEnabled && pos == "DH") {
        this.Game.HomeTeam.SetDesignatedHitter(new GamePlayerViewModel(pos, hitter, pitcher));
      }
    }
    else {
      if (pos == "SP") {
        this.Game.AwayTeam.SetPitcher(new GamePlayerViewModel(pos, hitter, pitcher), this.Game.IsDesignatedHitterEnabled);
      }
      else if (pos == "C") {
        this.Game.AwayTeam.SetCatcher(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "1B") {
        this.Game.AwayTeam.SetFirstBase(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "2B") {
        this.Game.AwayTeam.SetSecondBase(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "SS") {
        this.Game.AwayTeam.SetShortstop(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "3B") {
        this.Game.AwayTeam.SetThirdBase(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "LF") {
        this.Game.AwayTeam.SetLeftField(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "CF") {
        this.Game.AwayTeam.SetCenterField(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (pos == "RF") {
        this.Game.AwayTeam.SetRightField(new GamePlayerViewModel(pos, hitter, pitcher));
      }
      else if (this.Game.IsDesignatedHitterEnabled && pos == "DH") {
        this.Game.AwayTeam.SetDesignatedHitter(new GamePlayerViewModel(pos, hitter, pitcher));
      }
    }

    if (this.HomeTeamRoster.suggestedLineup && this.AwayTeamRoster.suggestedLineup
      && this.HomeTeamRoster.suggestedRotation && this.AwayTeamRoster.suggestedRotation) {
      this.scrollToTop();
    }
  }

  playerIsInStartingLineup(isHome: boolean, playerId): boolean {
    if (isHome) {
      if (!this.Game.IsDesignatedHitterEnabled && this.Game.HomeTeam.Pitcher && this.Game.HomeTeam.Pitcher.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.Catcher && this.Game.HomeTeam.Catcher.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.FirstBaseman && this.Game.HomeTeam.FirstBaseman.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.SecondBaseman && this.Game.HomeTeam.SecondBaseman.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.Shortstop && this.Game.HomeTeam.Shortstop.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.ThirdBaseman && this.Game.HomeTeam.ThirdBaseman.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.LeftFielder && this.Game.HomeTeam.LeftFielder.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.CenterFielder && this.Game.HomeTeam.CenterFielder.Id == playerId) {
        return true;
      }
      else if (this.Game.HomeTeam.RightFielder && this.Game.HomeTeam.RightFielder.Id == playerId) {
        return true;
      }
      else if (this.Game.IsDesignatedHitterEnabled && this.Game.HomeTeam.DesignatedHitter && this.Game.HomeTeam.DesignatedHitter.Id == playerId) {
        return true;
      }

      return false;
    } else {
      if (!this.Game.IsDesignatedHitterEnabled && this.Game.AwayTeam.Pitcher && this.Game.AwayTeam.Pitcher.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.Catcher && this.Game.AwayTeam.Catcher.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.FirstBaseman && this.Game.AwayTeam.FirstBaseman.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.SecondBaseman && this.Game.AwayTeam.SecondBaseman.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.Shortstop && this.Game.AwayTeam.Shortstop.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.ThirdBaseman && this.Game.AwayTeam.ThirdBaseman.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.LeftFielder && this.Game.AwayTeam.LeftFielder.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.CenterFielder && this.Game.AwayTeam.CenterFielder.Id == playerId) {
        return true;
      }
      else if (this.Game.AwayTeam.RightFielder && this.Game.AwayTeam.RightFielder.Id == playerId) {
        return true;
      }
      else if (this.Game.IsDesignatedHitterEnabled && this.Game.AwayTeam.DesignatedHitter && this.Game.AwayTeam.DesignatedHitter.Id == playerId) {
        return true;
      }

      return false;
    }
  }

  UseSuggestedHomeLineup() {
    this.ClearHomeTeamLineup();
    if (this.HomeTeamRoster && this.HomeTeamRoster.suggestedLineup && this.HomeTeamRoster.suggestedLineup.length > 0) {
      for (let player of this.HomeTeamRoster.suggestedLineup) {
        this.setLineupPosition(player.player.position, true, player, null);
      }
    }
    if (this.HomeTeamRoster && this.HomeTeamRoster.suggestedRotation && this.HomeTeamRoster.suggestedRotation.length > 0) {
      let firstPitcher = this.HomeTeamRoster.suggestedRotation[0];
      this.setLineupPosition('SP', true, null, firstPitcher);
    }
  }

  UseSuggestedAwayLineup() {
    this.ClearAwayTeamLineup();
    if (this.AwayTeamRoster && this.AwayTeamRoster.suggestedLineup && this.AwayTeamRoster.suggestedLineup.length > 0) {
      for (let player of this.AwayTeamRoster.suggestedLineup) {
        this.setLineupPosition(player.player.position, false, player, null);
      }
    }
    if (this.AwayTeamRoster && this.AwayTeamRoster.suggestedRotation && this.AwayTeamRoster.suggestedRotation.length > 0) {
      let firstPitcher = this.AwayTeamRoster.suggestedRotation[0];
      this.setLineupPosition('SP', false, null, firstPitcher);
    }
  }

  ClearHomeTeamLineup() {
    this.Game.HomeTeam.Pitcher = null;
    this.Game.HomeTeam.Catcher = null;
    this.Game.HomeTeam.FirstBaseman = null;
    this.Game.HomeTeam.SecondBaseman = null;
    this.Game.HomeTeam.Shortstop = null;
    this.Game.HomeTeam.ThirdBaseman = null;
    this.Game.HomeTeam.LeftFielder = null;
    this.Game.HomeTeam.CenterFielder = null;
    this.Game.HomeTeam.RightFielder = null;
    if (this.Game.IsDesignatedHitterEnabled) {
      this.Game.HomeTeam.DesignatedHitter = null;
    }
  }

  ClearAwayTeamLineup() {
    this.Game.AwayTeam.Pitcher = null;
    this.Game.AwayTeam.Catcher = null;
    this.Game.AwayTeam.FirstBaseman = null;
    this.Game.AwayTeam.SecondBaseman = null;
    this.Game.AwayTeam.Shortstop = null;
    this.Game.AwayTeam.ThirdBaseman = null;
    this.Game.AwayTeam.LeftFielder = null;
    this.Game.AwayTeam.CenterFielder = null;
    this.Game.AwayTeam.RightFielder = null;
    if (this.Game.IsDesignatedHitterEnabled) {
      this.Game.AwayTeam.DesignatedHitter = null;
    }
  }

  SaveHomeTeamBenchPlayers() {
    if (!this.HomeTeamRoster || !this.HomeTeamRoster.hitters) return;
    for (let player of this.HomeTeamRoster.hitters) {
      if ((this.Game.HomeTeam.Catcher && this.Game.HomeTeam.Catcher.Id != player.player.id) &&
        (this.Game.HomeTeam.FirstBaseman && this.Game.HomeTeam.FirstBaseman.Id != player.player.id) &&
        (this.Game.HomeTeam.SecondBaseman && this.Game.HomeTeam.SecondBaseman.Id != player.player.id) &&
        (this.Game.HomeTeam.Shortstop && this.Game.HomeTeam.Shortstop.Id != player.player.id) &&
        (this.Game.HomeTeam.ThirdBaseman && this.Game.HomeTeam.ThirdBaseman.Id != player.player.id) &&
        (this.Game.HomeTeam.LeftFielder && this.Game.HomeTeam.LeftFielder.Id != player.player.id) &&
        (this.Game.HomeTeam.CenterFielder && this.Game.HomeTeam.CenterFielder.Id != player.player.id) &&
        (this.Game.HomeTeam.RightFielder && this.Game.HomeTeam.RightFielder.Id != player.player.id) &&
        (!this.Game.IsDesignatedHitterEnabled || !this.Game.HomeTeam.DesignatedHitter || this.Game.HomeTeam.DesignatedHitter.Id != player.player.id)) {
        this.Game.HomeTeam.SetRosterBenchPositionPlayer(new GamePlayerViewModel(player.player.position, player, null));
      }
    }
  }

  SaveHomeTeamBenchPitchers() {
    if (!this.HomeTeamRoster || !this.HomeTeamRoster.pitchers) return;
    for (let player of this.HomeTeamRoster.pitchers) {
      if (!this.Game.HomeTeam.Pitcher || this.Game.HomeTeam.Pitcher.Id != player.player.id) {
        this.Game.HomeTeam.SetRosterBenchPitcher(new GamePlayerViewModel(player.player.position, null, player));
      }
    }
  }

  SaveAwayTeamBenchPlayers() {
    if (!this.AwayTeamRoster || !this.AwayTeamRoster.hitters) return;
    for (let player of this.AwayTeamRoster.hitters) {
      if ((this.Game.AwayTeam.Catcher && this.Game.AwayTeam.Catcher.Id != player.player.id) &&
        (this.Game.AwayTeam.FirstBaseman && this.Game.AwayTeam.FirstBaseman.Id != player.player.id) &&
        (this.Game.AwayTeam.SecondBaseman && this.Game.AwayTeam.SecondBaseman.Id != player.player.id) &&
        (this.Game.AwayTeam.Shortstop && this.Game.AwayTeam.Shortstop.Id != player.player.id) &&
        (this.Game.AwayTeam.ThirdBaseman && this.Game.AwayTeam.ThirdBaseman.Id != player.player.id) &&
        (this.Game.AwayTeam.LeftFielder && this.Game.AwayTeam.LeftFielder.Id != player.player.id) &&
        (this.Game.AwayTeam.CenterFielder && this.Game.AwayTeam.CenterFielder.Id != player.player.id) &&
        (this.Game.AwayTeam.RightFielder && this.Game.AwayTeam.RightFielder.Id != player.player.id) &&
        (!this.Game.IsDesignatedHitterEnabled || !this.Game.AwayTeam.DesignatedHitter || this.Game.AwayTeam.DesignatedHitter.Id != player.player.id)) {
        this.Game.AwayTeam.SetRosterBenchPositionPlayer(new GamePlayerViewModel(player.player.position, player, null));
      }
    }
  }

  SaveAwayTeamBenchPitchers() {
    if (!this.AwayTeamRoster || !this.AwayTeamRoster.pitchers) return;
    for (let player of this.AwayTeamRoster.pitchers) {
      if (!this.Game.AwayTeam.Pitcher || this.Game.AwayTeam.Pitcher.Id != player.player.id) {
        this.Game.AwayTeam.SetRosterBenchPitcher(new GamePlayerViewModel(player.player.position, null, player));
      }
    }
  }

  RemoveHomePlayerAtLineupNumber(lineupNumber: number) {
    if (lineupNumber == -1 && this.Game.HomeTeam.Pitcher)
      this.Game.HomeTeam.Pitcher = null;
    else
      this.Game.HomeTeam.RemovePlayerAtLineupNumber(lineupNumber);
  }

  RemoveAwayPlayerAtLineupNumber(lineupNumber: number) {
    if (lineupNumber == -1 && this.Game.AwayTeam.Pitcher)
      this.Game.AwayTeam.Pitcher = null;
    else
      this.Game.AwayTeam.RemovePlayerAtLineupNumber(lineupNumber);
  }

  StartGame() {
    this.SaveHomeTeamBenchPlayers();
    this.SaveAwayTeamBenchPlayers();
    this.SaveHomeTeamBenchPitchers();
    this.SaveAwayTeamBenchPitchers();
   // localStorage.setItem('bittlebattlebaseball_game_instance' + this.GameId, JSON.stringify(this.Game));
    this.router.navigateByUrl("/game/" + this.GameId);
    //   this.router.navigateByUrl("/game/" + this.GameId, { state: this.Game });
  }

  ngOnInit() {
    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
