import { Component, OnInit, PipeTransform } from "@angular/core";
import { GameViewModel } from "../game-view-model";
import { MLBYearByYearBattingStatsViewModel } from "../mlbyear-by-year-batting-stats-view-model";
import { MLBYearByYearPitchingStatsViewModel } from "../mlbyear-by-year-pitching-stats-view-model";
import { Router, ActivatedRoute } from "@angular/router";
import { MLBYearByYearLeagueStatsServiceService } from "../mlbyear-by-year-league-stats-service.service";
import { GamePlayerViewModel } from "../game-player-view-model";
import { EnumAtBatResult } from "../enum-at-bat-result.enum";
import { ToastrService } from "ngx-toastr";

import { GameInningViewModel } from "../game-inning-view-model";
import { BattingAvgPipePipe } from "../batting-avg-pipe.pipe";
//import swal from 'sweetalert';

@Component({
  selector: "app-gameplay",
  templateUrl: "./gameplay.component.html",
  styleUrls: ["./gameplay.component.scss"],
})
export class GameplayComponent implements OnInit {
  timers = [];

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  batHittingBallSound = new Audio("../assets/audio/batHittingBall.mp3");
  pitchSound = new Audio("../assets/assets/audio/caughtball.mp3");
  IsSoundMuted: boolean = false;

  screenPctAdj: number = 0.65;

  IsPlayInProgress: boolean = false;

  leftFieldCornerX: number;
  leftFieldCornerY: number;
  leftCenterWallX: number;
  leftCenterWallY: number;
  centerWallX: number;
  centerWallY: number;
  rightFieldCornerX: number;
  rightFieldCornerY: number;
  rightCenterWallX: number;
  rightCenterWallY: number;

  homePlateX: number = 950 * this.screenPctAdj;
  homePlateY: number = 1170 * this.screenPctAdj;
  firstBaseX: number = 1220 * this.screenPctAdj;
  firstBaseY: number = 900 * this.screenPctAdj;
  secondBaseX: number = 910 * this.screenPctAdj;
  secondBaseY: number = 750 * this.screenPctAdj;
  thirdBaseX: number = 620 * this.screenPctAdj;
  thirdBaseY: number = 880 * this.screenPctAdj;

  rightHandedBatterX: number = 848 * this.screenPctAdj;
  rightHandedBatterY: number = 1120 * this.screenPctAdj;
  leftHandedBatterX: number = 985 * this.screenPctAdj;
  leftHandedBatterY: number = 1120 * this.screenPctAdj;

  homeOnDeckBatterX: number = 1300 * this.screenPctAdj;
  homeOnDeckBatterY: number = 1173 * this.screenPctAdj;
  awayOnDeckBatterX: number = 480 * this.screenPctAdj;
  awayOnDeckBatterY: number = 1173 * this.screenPctAdj;

  catcherX: number = 915 * this.screenPctAdj;
  catcherY: number = 1217 * this.screenPctAdj;
  pitcherX: number = 918 * this.screenPctAdj;
  pitcherY: number = 870 * this.screenPctAdj;
  firstBasemanX: number = 1210 * this.screenPctAdj;
  firstBasemanY: number = 813 * this.screenPctAdj;
  secondBasemanX: number = 1045 * this.screenPctAdj;
  secondBasemanY: number = 763 * this.screenPctAdj;
  thirdBasemanX: number = 625 * this.screenPctAdj;
  thirdBasemanY: number = 813 * this.screenPctAdj;
  shortstopX: number = 775 * this.screenPctAdj;
  shortstopY: number = 763 * this.screenPctAdj;
  leftFielderX: number = 430 * this.screenPctAdj;
  leftFielderY: number = 543 * this.screenPctAdj;
  centerFielderX: number = 935 * this.screenPctAdj;
  centerFielderY: number = 483 * this.screenPctAdj;
  rightFielderX: number = 1430 * this.screenPctAdj;
  rightFielderY: number = 543 * this.screenPctAdj;

  canvasWidth: number = 1920 * this.screenPctAdj;
  canvasHeight: number = 1371 * this.screenPctAdj;

  Game: GameViewModel; //= new GameViewModel();
  lineupNumbers: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  GameId: number;

  playerFieldImgAvatarHeight: number = 60;
  playerFieldImgAvatarWidth: number = 40;

  _leagueHomeBattingStats: MLBYearByYearBattingStatsViewModel;
  _leagueAwayBattingStats: MLBYearByYearBattingStatsViewModel;
  _leagueHomePitchingStats: MLBYearByYearPitchingStatsViewModel;
  _leagueAwayPitchingStats: MLBYearByYearPitchingStatsViewModel;
  newOuts: number = 1;
  IsAutoPlayEnabled: boolean;

  ngAfterViewInit(): void {
    this.SetPlayingField();
    let position = "toast-top-center";
    let msg =
      "Today's ballgame is between the " +
      this.Game.HomeTeam.TeamSeason +
      " " +
      this.Game.HomeTeam.TeamName +
      " and the " +
      this.Game.AwayTeam.TeamSeason +
      " " +
      this.Game.AwayTeam.TeamName;
    this.toastr.success(
      msg,
      "Welcome to " + this.Game.Ballpark + " in " + this.Game.HomeTeam.TeamCity,
      {
        timeOut: 7000,
        positionClass: position,
        messageClass: "toast-message",
      }
    );
  }

  ngOnInit() {
  }

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    game: GameViewModel,
    mlbYearByYearLeagueStatsServiceService: MLBYearByYearLeagueStatsServiceService,
    private toastr: ToastrService,
    private battingAvgPipe: BattingAvgPipePipe //, private toastr: ToastrService
  ) {
    let d = new Date();
    let t = d.getTime().toString();
    document.body.style.backgroundImage =
      "url('../assets/images/baseball-background" +
      t.substring(t.length - 1, t.length) +
      ".jpg')";

    this.GameId = activatedRoute.snapshot.params["gameId"];

    this.Game = game;

    try {
      mlbYearByYearLeagueStatsServiceService
        .GetLeaguePitchingStatsByYear(this.Game.AwayTeam.TeamSeason)
        .subscribe((data) => {
          this._leagueAwayPitchingStats = data;
        });
    } catch {
      console.log("Can't get pitching league stats for Away Team...");
    }

    try {
      mlbYearByYearLeagueStatsServiceService
        .GetLeaguePitchingStatsByYear(this.Game.HomeTeam.TeamSeason)
        .subscribe((data) => {
          this._leagueHomePitchingStats = data;
        });
    } catch {
      console.log("Can't get pitching league stats for Home Team...");
    }

    mlbYearByYearLeagueStatsServiceService
      .GetLeagueBattingStatsByYear(this.Game.HomeTeam.TeamSeason)
      .subscribe((homeData) => {
        this._leagueHomeBattingStats = homeData;

        mlbYearByYearLeagueStatsServiceService
          .GetLeagueBattingStatsByYear(this.Game.AwayTeam.TeamSeason)
          .subscribe((awayData) => {
            this._leagueAwayBattingStats = awayData;

            this.Game.StartGame();
          });
      });
  }

  SetAutoExecuteNextPlay() {
    setInterval(() => {
      if (this.IsAutoPlayEnabled) {
        this.ExecuteNextPlay();
      }
    }, 4500);
  }

  setAutoPlay() {
    this.IsAutoPlayEnabled = !this.IsAutoPlayEnabled;
  }

  ExecuteNextPlay() {
    this.newOuts = 1; //Reset each time
    this.IsPlayInProgress = true;
    this.Game.RunnersWhoScoredOnPlay = [];
    this.ClearCanvas();

    this.Game.CurrentAtBat.Batter.HittingSeasonStats.OBRP =
      this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.PX *
      this.Game.CurrentAtBat.Batter.HittingSeasonStats.obp;

    this.timers.push(
      setTimeout(() => {
        this.Pitch();

        this.timers.push(
          setTimeout(() => {
            let diceRoll = this.GenerateRandomNumber(1, 1000);
            //this.showWarning("Dice Roll is " + diceRoll + " Current Batter OBRP : " + this.Game.CurrentAtBat.Batter.HittingSeasonStats.OBRP);

            if (
              diceRoll <=
              this.Game.CurrentAtBat.Batter.HittingSeasonStats.OBRP * 1000
            ) {
              this.ExecuteCurrentBatterReachedBase();
            } else {
              this.ExecuteCurrentBatterIsOut();
            }

            this.timers.push(
              setTimeout(() => {
                this.IsPlayInProgress = false;
                this.ClearCanvas();
                this.ClearTimers();
              }, 2500)
            );
          }, 300)
        );
      }, 200)
    );
  }

  GenerateRandomNumber(from: number, to: number): number {
    let randomNumber = Math.floor(Math.random() * to + from);
    console.log("Random # generated : " + randomNumber);
    return randomNumber;
  }

  ExecuteCurrentBatterReachedBase() {
    this.Game.RunnersWhoScoredOnPlay = [];
    let typeOfReachedBase = this.GenerateRandomNumber(1, 1000);
    let diceRoll: number;
    if (this.Game.CurrentInning.IsBottomOfInning) {
      let addedPower =
        this.Game.CurrentAtBat.Batter.HittingSeasonStats.slg /
        this._leagueHomeBattingStats.slg;
      diceRoll = addedPower * typeOfReachedBase;
    } else {
      let addedPower =
        this.Game.CurrentAtBat.Batter.HittingSeasonStats.slg /
        this._leagueAwayBattingStats.slg;
      diceRoll = addedPower * typeOfReachedBase;
    }

    let basesAdded = 1;
    //TODO - Numbers based off of 2019 totals, need to pull in stats for year of batter
    if (diceRoll <= 215) {
      //Walks
      this.BatterWalked();
      this.showInfo(this.Game.CurrentAtBat.Batter.Name + " walked.");

      this.Game.CurrentAtBat.Result = EnumAtBatResult.Walk;

      if (this.Game.RunnerOnThird) {
        if (this.Game.RunnerOnSecond && this.Game.RunnerOnFirst) {
          this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
          this.Game.RunnerOnThird = null;
        }
      }

      if (this.Game.RunnerOnSecond) {
        if (this.Game.RunnerOnFirst) {
          this.Game.RunnerOnThird = this.Game.RunnerOnSecond;
          this.Game.RunnerOnSecond = null;
        }
      }

      if (this.Game.RunnerOnFirst) {
        this.Game.RunnerOnSecond = this.Game.RunnerOnFirst;
        this.Game.RunnerOnFirst = null;
      }

      for (let playerWhoScored of this.Game.RunnersWhoScoredOnPlay) {
        if (this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentInning.HomeRunsScored++;
          this.Game.HomeTeamRuns++;
        } else {
          this.Game.CurrentInning.AwayRunsScored++;
          this.Game.AwayTeamRuns++;
        }

        playerWhoScored.RunsScored++;
        this.Game.CurrentAtBat.Batter.RBIs++;
        this.Game.CurrentAtBat.RunsScored++;
        this.showSuccess(playerWhoScored.Name + " scored!");
      }

      this.Game.RunnerOnFirst = this.Game.CurrentAtBat.Batter;
    } else if (diceRoll > 215 && diceRoll <= 783) {
      //Singles

      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.HomeTeamHits++;
      } else {
        this.Game.AwayTeamHits++;
      }

      let singleHitDiceRoll = this.GenerateRandomNumber(1, 6);

      if (singleHitDiceRoll <= 1) {
        this.GroundBallSingleLeft1();
        this.showInfo(this.Game.CurrentAtBat.Batter.Name + " singles to left.");
      } else if (singleHitDiceRoll == 2) {
        this.GroundBallSingleLeft2();
        this.showInfo(this.Game.CurrentAtBat.Batter.Name + " singles to left.");
      } else if (singleHitDiceRoll == 3) {
        this.GroundBallSingleCenter1();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name + " singles to center."
        );
      } else if (singleHitDiceRoll == 4) {
        this.GroundBallSingleCenter2();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name + " singles to center."
        );
      } else if (singleHitDiceRoll == 5) {
        this.GroundBallSingleRight1();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name + " singles to right."
        );
      } else if (singleHitDiceRoll == 6) {
        this.GroundBallSingleRight2();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name + " singles to right."
        );
      }

      this.Game.CurrentAtBat.Result = EnumAtBatResult.Single;

      if (this.Game.RunnerOnThird) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnerOnThird = this.Game.RunnerOnSecond;
        this.Game.RunnerOnSecond = null;
      }

      if (this.Game.RunnerOnFirst) {
        this.Game.RunnerOnSecond = this.Game.RunnerOnFirst;
        this.Game.RunnerOnFirst = null;
      }

      for (let playerWhoScored of this.Game.RunnersWhoScoredOnPlay) {
        if (this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentInning.HomeRunsScored++;
          this.Game.HomeTeamRuns++;
        } else {
          this.Game.CurrentInning.AwayRunsScored++;
          this.Game.AwayTeamRuns++;
        }

        playerWhoScored.RunsScored++;
        this.Game.CurrentAtBat.Batter.RBIs++;
        this.Game.CurrentAtBat.RunsScored++;
        this.showSuccess(playerWhoScored.Name + " scored!");
      }

      this.Game.RunnerOnFirst = this.Game.CurrentAtBat.Batter;
      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.CurrentInning.AwayHits++;
      } else {
        this.Game.CurrentInning.AwayHits++;
      }
    } else if (diceRoll > 783 && diceRoll <= 959) {
      //Doubles

      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.HomeTeamHits++;
      } else {
        this.Game.AwayTeamHits++;
      }

      let doubleHitDiceRoll = this.GenerateRandomNumber(1, 3);
      basesAdded = 2;
      if (doubleHitDiceRoll <= 1) {
        this.FlyBallDoubleLeft1();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name + " doubles on fly to left."
        );
      } else if (doubleHitDiceRoll == 2) {
        this.FlyBallDoubleLeftCenter1();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name + " doubles on fly to left-center."
        );
      } else {
        this.GroundBallDoubleLeft1();
        this.showInfo(
          this.Game.CurrentAtBat.Batter.Name +
            " doubles on ground-ball to left."
        );
      }

      this.Game.CurrentAtBat.Result = EnumAtBatResult.Double;

      if (this.Game.RunnerOnThird) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnSecond);
        this.Game.RunnerOnSecond = null;
      }

      if (this.Game.RunnerOnFirst) {
        this.Game.RunnerOnThird = this.Game.RunnerOnFirst;
        this.Game.RunnerOnFirst = null;
      }

      for (let playerWhoScored of this.Game.RunnersWhoScoredOnPlay) {
        if (this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentInning.HomeRunsScored++;
          this.Game.HomeTeamRuns++;
        } else {
          this.Game.CurrentInning.AwayRunsScored++;
          this.Game.AwayTeamRuns++;
        }

        playerWhoScored.RunsScored++;
        this.Game.CurrentAtBat.Batter.RBIs++;
        this.Game.CurrentAtBat.RunsScored++;
        this.showSuccess(playerWhoScored.Name + " scored!");
      }

      this.Game.RunnerOnSecond = this.Game.CurrentAtBat.Batter;
      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.CurrentInning.AwayHits++;
      } else {
        this.Game.CurrentInning.AwayHits++;
      }
    } else if (diceRoll > 959 && diceRoll <= 975) {
      //Triples
      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.HomeTeamHits++;
      } else {
        this.Game.AwayTeamHits++;
      }

      let tripleHitDiceRoll = this.GenerateRandomNumber(1, 2);
      basesAdded = 3;
      if (tripleHitDiceRoll <= 1) {
        //this.GroundBallSingleLeft1();
        this.showInfo(this.Game.CurrentAtBat.Batter.Name + " triples to left.");
      } else {
        //this.GroundBallSingleLeft2();
        this.showInfo(this.Game.CurrentAtBat.Batter.Name + " triples to left.");
      }

      this.Game.CurrentAtBat.Result = EnumAtBatResult.Triple;

      if (this.Game.RunnerOnThird) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnSecond);
        this.Game.RunnerOnSecond = null;
      }

      if (this.Game.RunnerOnFirst) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnFirst);
        this.Game.RunnerOnFirst = null;
      }

      for (let playerWhoScored of this.Game.RunnersWhoScoredOnPlay) {
        if (this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentInning.HomeRunsScored++;
          this.Game.HomeTeamRuns++;
        } else {
          this.Game.CurrentInning.AwayRunsScored++;
          this.Game.AwayTeamRuns++;
        }

        playerWhoScored.RunsScored++;
        this.Game.CurrentAtBat.Batter.RBIs++;
        this.Game.CurrentAtBat.RunsScored++;
        this.showSuccess(playerWhoScored.Name + " scored!");
      }

      this.Game.RunnerOnThird = this.Game.CurrentAtBat.Batter;

      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.CurrentInning.AwayHits++;
      } else {
        this.Game.CurrentInning.AwayHits++;
      }
    } else if (diceRoll > 975) {
      //Homers
      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.HomeTeamHits++;
      } else {
        this.Game.AwayTeamHits++;
      }

      let homerDiceRoll = this.GenerateRandomNumber(1, 8);
      basesAdded = 4;
      if (homerDiceRoll <= 1) {
        this.HomerLeftFieldLine();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name +
            " homers down the left field line."
        );
      } else if (homerDiceRoll == 2) {
        this.LongHomerLeftFieldLine();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name + " hits a long homerun to left."
        );
      } else if (homerDiceRoll == 3) {
        this.HomerLeftField();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name + " homers to left field."
        );
      } else if (homerDiceRoll == 4) {
        this.HomerLeftCenterField();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name + " homers to left-center field."
        );
      } else if (homerDiceRoll == 5) {
        this.HomerCenterField();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name + " homers to center field."
        );
      } else if (homerDiceRoll == 6) {
        this.HomerRightCenterField();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name + " homers to right-center field."
        );
      } else if (homerDiceRoll == 7) {
        this.HomerRightField();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name + " homers to right field."
        );
      } else if (homerDiceRoll == 8) {
        this.HomerRightFieldLine();
        this.showSuccess(
          this.Game.CurrentAtBat.Batter.Name +
            " homers down the right field line."
        );
      }

      this.Game.CurrentAtBat.Result = EnumAtBatResult.HomeRun;

      if (this.Game.RunnerOnThird) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnSecond);
        this.Game.RunnerOnSecond = null;
      }

      if (this.Game.RunnerOnFirst) {
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnFirst);
        this.Game.RunnerOnFirst = null;
      }

      this.Game.RunnersWhoScoredOnPlay.push(this.Game.CurrentAtBat.Batter);

      for (let playerWhoScored of this.Game.RunnersWhoScoredOnPlay) {
        if (this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentInning.HomeRunsScored++;
          this.Game.HomeTeamRuns++;
        } else {
          this.Game.CurrentInning.AwayRunsScored++;
          this.Game.AwayTeamRuns++;
        }

        playerWhoScored.RunsScored++;
        this.Game.CurrentAtBat.Batter.RBIs++;
        this.Game.CurrentAtBat.RunsScored++;
        this.showSuccess(playerWhoScored.Name + " scored!");
      }

      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.CurrentInning.AwayHits++;
      } else {
        this.Game.CurrentInning.AwayHits++;
      }
    }

    //***
    this.Game.NewAtBat();
    if (this.Game.CurrentInning.IsBottomOfInning) {
      let pitcherTiredFactor = this.Game.AwayTeam.HasReliefPitcherBeenUsed
        ? 1.030485
        : 1.004355;
      this.DrawHitterOnHomeDeck();
      this.Game.AwayTeam.Pitcher.PitchingSeasonStats.PX =
        this.Game.AwayTeam.Pitcher.PitchingSeasonStats.PX * pitcherTiredFactor;
    } else {
      let pitcherTiredFactor = this.Game.HomeTeam.HasReliefPitcherBeenUsed
        ? 1.030485
        : 1.004355;
      this.DrawHitterOnAwayDeck();
      this.Game.HomeTeam.Pitcher.PitchingSeasonStats.PX =
        this.Game.HomeTeam.Pitcher.PitchingSeasonStats.PX * pitcherTiredFactor;
    }
  }

  ExecuteCurrentBatterIsOut() {
    this.Game.RunnersWhoScoredOnPlay = [];
    let diceRoll = this.GenerateRandomNumber(1, 24);
    //this.showWarning("Dice Roll is " + diceRoll);

    this.Game.CurrentAtBat.Result = EnumAtBatResult.Out;

    if (diceRoll == 1) {
      this.FlyBallOutToFirst();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to first."
      );
    } else if (diceRoll == 2) {
      this.FlyBallOutToSecond();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to second."
      );
    } else if (diceRoll == 3) {
      this.FlyBallOutToThird();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to third."
      );
    } else if (diceRoll == 4) {
      this.FlyBallOutToShortstop();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to shortstop."
      );
    } else if (diceRoll == 5) {
      this.FlyBallOutToLeftField();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to left field."
      );

      //Sac Fly Logic
      if (
        (this.Game.CurrentInning.IsBottomOfInning &&
          this.Game.CurrentInning.HomeOuts <= 1) ||
        (!this.Game.CurrentInning.IsBottomOfInning &&
          this.Game.CurrentInning.AwayOuts <= 1)
      ) {
        if (this.Game.RunnerOnThird) {
          if (
            this.Game.RunnerOnThird.Position == "CF" ||
            this.Game.RunnerOnThird.Position == "SS" ||
            this.Game.RunnerOnThird.Position == "2B"
          ) {
            let random = this.GenerateRandomNumber(1, 5);
            this.DrawThrowFromLeftFieldToHome();
            if (random != 1) {
              //Runner Scores on sac fly
              this.showSuccess(
                this.Game.RunnerOnThird.Name + " scores on sac fly."
              );
              this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
              this.Game.RunnerOnThird = null;
            } else {
              //runner out on sac fly
              this.showError(
                this.Game.RunnerOnThird.Name + " thrown out at home."
              );
              this.Game.RunnerOnThird = null;
              if (this.Game.CurrentInning.IsBottomOfInning) {
                this.Game.CurrentInning.HomeOuts++;
              } else {
                this.Game.CurrentInning.AwayOuts++;
              }
            }
          } else if (
            this.Game.RunnerOnThird.Position == "LF" ||
            this.Game.RunnerOnThird.Position == "3B" ||
            this.Game.RunnerOnThird.Position == "RF"
          ) {
            let random = this.GenerateRandomNumber(0, 1);
            this.DrawThrowFromLeftFieldToHome();
            if (random == 1) {
              //Runner Scores on sac fly
              this.showSuccess(
                this.Game.RunnerOnThird.Name + " scores on sac fly."
              );
              this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
              this.Game.RunnerOnThird = null;
            } else {
              //runner out on sac fly
              this.showError(
                this.Game.RunnerOnThird.Name + " thrown out at home."
              );
              this.Game.RunnerOnThird = null;
              if (this.Game.CurrentInning.IsBottomOfInning) {
                this.Game.CurrentInning.HomeOuts++;
              } else {
                this.Game.CurrentInning.AwayOuts++;
              }
            }
          }
        }
      }
    } else if (diceRoll == 6) {
      this.FlyBallOutToCenterField();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to center field."
      );

      //Sac Fly Logic
      if (
        (this.Game.CurrentInning.IsBottomOfInning &&
          this.Game.CurrentInning.HomeOuts <= 1) ||
        (!this.Game.CurrentInning.IsBottomOfInning &&
          this.Game.CurrentInning.AwayOuts <= 1)
      ) {
        if (this.Game.RunnerOnThird) {
          if (
            this.Game.RunnerOnThird.Position == "CF" ||
            this.Game.RunnerOnThird.Position == "SS" ||
            this.Game.RunnerOnThird.Position == "2B"
          ) {
            let random = this.GenerateRandomNumber(1, 4);
            this.DrawThrowFromCenterFieldToHome();
            if (random != 1) {
              //Runner Scores on sac fly
              this.showSuccess(
                this.Game.RunnerOnThird.Name + " scores on sac fly."
              );
              this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
              this.Game.RunnerOnThird = null;
            } else {
              //runner out on sac fly
              this.showError(
                this.Game.RunnerOnThird.Name + " thrown out at home."
              );
              this.Game.RunnerOnThird = null;
              if (this.Game.CurrentInning.IsBottomOfInning) {
                this.Game.CurrentInning.HomeOuts++;
              } else {
                this.Game.CurrentInning.AwayOuts++;
              }
            }
          } else if (
            this.Game.RunnerOnThird.Position == "LF" ||
            this.Game.RunnerOnThird.Position == "3B" ||
            this.Game.RunnerOnThird.Position == "RF"
          ) {
            let random = this.GenerateRandomNumber(0, 2);
            this.DrawThrowFromCenterFieldToHome();
            if (random == 1) {
              //Runner Scores on sac fly
              this.showSuccess(
                this.Game.RunnerOnThird.Name + " scores on sac fly."
              );
              this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
              this.Game.RunnerOnThird = null;
            } else {
              //runner out on sac fly
              this.showError(
                this.Game.RunnerOnThird.Name + " thrown out at home."
              );
              this.Game.RunnerOnThird = null;
              if (this.Game.CurrentInning.IsBottomOfInning) {
                this.Game.CurrentInning.HomeOuts++;
              } else {
                this.Game.CurrentInning.AwayOuts++;
              }
            }
          }
        }
      }
    } else if (diceRoll == 7) {
      this.FlyBallOutToRightField();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to right field."
      );

      //Sac Fly Logic
      if (
        (this.Game.CurrentInning.IsBottomOfInning &&
          this.Game.CurrentInning.HomeOuts <= 1) ||
        (!this.Game.CurrentInning.IsBottomOfInning &&
          this.Game.CurrentInning.AwayOuts <= 1)
      ) {
        if (this.Game.RunnerOnThird) {
          if (
            this.Game.RunnerOnThird.Position == "CF" ||
            this.Game.RunnerOnThird.Position == "SS" ||
            this.Game.RunnerOnThird.Position == "2B"
          ) {
            let random = this.GenerateRandomNumber(1, 6);
            this.DrawThrowFromRightFieldToHome();
            if (random != 1) {
              //Runner Scores on sac fly
              this.showSuccess(
                this.Game.RunnerOnThird.Name + " scores on sac fly."
              );
              this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
              this.Game.RunnerOnThird = null;
            } else {
              //runner out on sac fly
              this.showError(
                this.Game.RunnerOnThird.Name + " thrown out at home."
              );
              this.Game.RunnerOnThird = null;
              if (this.Game.CurrentInning.IsBottomOfInning) {
                this.Game.CurrentInning.HomeOuts++;
              } else {
                this.Game.CurrentInning.AwayOuts++;
              }
            }
          } else if (
            this.Game.RunnerOnThird.Position == "LF" ||
            this.Game.RunnerOnThird.Position == "3B" ||
            this.Game.RunnerOnThird.Position == "RF"
          ) {
            let random = this.GenerateRandomNumber(0, 2);
            this.DrawThrowFromRightFieldToHome();
            if (random == 1) {
              //Runner Scores on sac fly
              this.showSuccess(
                this.Game.RunnerOnThird.Name + " scores on sac fly."
              );
              this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
              this.Game.RunnerOnThird = null;
            } else {
              //runner out on sac fly
              this.showError(
                this.Game.RunnerOnThird.Name + " thrown out at home."
              );
              this.Game.RunnerOnThird = null;
              if (this.Game.CurrentInning.IsBottomOfInning) {
                this.Game.CurrentInning.HomeOuts++;
              } else {
                this.Game.CurrentInning.AwayOuts++;
              }
            }
          }
        }
      }
    } else if (diceRoll == 8) {
      this.FlyBallOutToPitcher();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to pitcher."
      );
    } else if (diceRoll == 9) {
      this.FlyBallOutToCatcher();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " pops out to catcher."
      );
    } else if (diceRoll == 10) {
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " strikes out swinging."
      );
      this.Game.CurrentAtBat.Result = EnumAtBatResult.StrikeOut;
    } else if (diceRoll == 11) {
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " strikes out looking."
      );
      this.Game.CurrentAtBat.Result = EnumAtBatResult.StrikeOut;
    } else if (diceRoll == 12) {
      this.GroundBallOutToThird();
    } else if (diceRoll == 13) {
      this.GroundBallOutToShort();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " grounds out to shortstop."
      );
    } else if (diceRoll == 14) {
      this.GroundBallOutToSecond();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " grounds out to second."
      );
    } else if (diceRoll == 15) {
      this.GroundBallOutToFirst();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " grounds out to first."
      );
    } else if (diceRoll == 16) {
      this.GroundBallOutToPitcher();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " grounds out to pitcher."
      );
    } else if (diceRoll == 17) {
      this.LineOutToThird();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to third."
      );
    } else if (diceRoll == 18) {
      this.LineOutToShort();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to short."
      );
    } else if (diceRoll == 19) {
      this.LineOutToSecond();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to second."
      );
    } else if (diceRoll == 20) {
      this.LineOutToFirst();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to first."
      );
    } else if (diceRoll == 21) {
      this.LineOutToPitcher();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to pitcher."
      );
    } else if (diceRoll == 22) {
      this.LineOutToLeft();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to left."
      );
    } else if (diceRoll == 23) {
      this.LineOutToCenter();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to center."
      );
    } else if (diceRoll == 24) {
      this.LineOutToRight();
      this.showError(
        this.Game.CurrentAtBat.Batter.Name + " lines out to right."
      );
    }

    //Process players who scored
    for (let playerWhoScored of this.Game.RunnersWhoScoredOnPlay) {
      if (this.Game.CurrentInning.IsBottomOfInning) {
        this.Game.CurrentInning.HomeRunsScored++;
        this.Game.HomeTeamRuns++;
      } else {
        this.Game.CurrentInning.AwayRunsScored++;
        this.Game.AwayTeamRuns++;
      }

      playerWhoScored.RunsScored++;
      this.Game.CurrentAtBat.Batter.RBIs++;
      this.Game.CurrentAtBat.RunsScored++;
      this.showSuccess(playerWhoScored.Name + " scored!");
    }

    //Add to pitcher fatigue
    if (this.Game.CurrentInning.IsBottomOfInning) {
      let pitcherTiredFactor = this.Game.AwayTeam.HasReliefPitcherBeenUsed
        ? 1.030485
        : 1.004355;
      this.Game.AwayTeam.Pitcher.PitchingSeasonStats.PX =
        this.Game.AwayTeam.Pitcher.PitchingSeasonStats.PX * pitcherTiredFactor;
    } else {
      let pitcherTiredFactor = this.Game.HomeTeam.HasReliefPitcherBeenUsed
        ? 1.030485
        : 1.004355;
      this.Game.HomeTeam.Pitcher.PitchingSeasonStats.PX =
        this.Game.HomeTeam.Pitcher.PitchingSeasonStats.PX * pitcherTiredFactor;
    }

    this.ProcessEndOfOutPlay();
  }

  ClearTimers() {
    // clear all timers in the array
    for (var i = 0; i < this.timers.length; i++) {
      clearTimeout(this.timers[i]);
    }
  }

  ProcessEndOfOutPlay() {
    if (this.Game.CurrentInning.IsBottomOfInning) {
      this.Game.CurrentInning.HomeOuts += this.newOuts;
      if (
        this.Game.CurrentInning.InningNumber >= 9 &&
        this.Game.AwayTeamRuns != this.Game.HomeTeamRuns &&
        this.Game.CurrentInning.HomeOuts == 3
      ) {
        let position = "toast-top-center";

        let msg = "";
        if (this.Game.HomeTeamRuns > this.Game.AwayTeamRuns) {
          msg =
            "The " +
            this.Game.HomeTeam.TeamSeason +
            " " +
            this.Game.HomeTeam.TeamName +
            " beat the " +
            this.Game.AwayTeam.TeamSeason +
            " " +
            this.Game.AwayTeam.TeamName +
            " " +
            this.Game.HomeTeamRuns +
            " to " +
            this.Game.AwayTeamRuns;
        } else {
          msg =
            "The " +
            this.Game.AwayTeam.TeamSeason +
            " " +
            this.Game.AwayTeam.TeamName +
            " beat the " +
            this.Game.HomeTeam.TeamSeason +
            " " +
            this.Game.HomeTeam.TeamName +
            " " +
            this.Game.AwayTeamRuns +
            " to " +
            this.Game.HomeTeamRuns;
        }
        this.toastr.success(msg, "Game Over!", {
          timeOut: 0,
          extendedTimeOut: 0,
          positionClass: position,
          messageClass: "toast-message",
        });

        this.Game.PlayByPlays.push(msg);
        this.Game.IsGameInProgress = false;

        this.ClearTimers();
        localStorage.clear();
      } else {
        if (this.Game.CurrentInning.HomeOuts == 3) {
          if (this.Game.CurrentInning.InningNumber >= 9) {
            this.Game.Innings.push(
              new GameInningViewModel(this.Game.CurrentInning.InningNumber + 1)
            );
          }

          this.Game.NextInning();
          this.Game.NewAtBat();
        } else {
          this.Game.NewAtBat();
        }
      }
    } else {
      this.Game.CurrentInning.AwayOuts += this.newOuts;

      if (this.Game.CurrentInning.AwayOuts == 3) {
        if (
          this.Game.CurrentInning.InningNumber >= 9 &&
          this.Game.AwayTeamRuns < this.Game.HomeTeamRuns
        ) {
          let position = "toast-top-center";
          let msg = "";
          if (this.Game.HomeTeamRuns > this.Game.AwayTeamRuns) {
            msg =
              "The " +
              this.Game.HomeTeam.TeamSeason +
              " " +
              this.Game.HomeTeam.TeamName +
              " beat the " +
              this.Game.AwayTeam.TeamSeason +
              " " +
              this.Game.AwayTeam.TeamName +
              " " +
              this.Game.HomeTeamRuns +
              " to " +
              this.Game.AwayTeamRuns;
          } else {
            msg =
              "The " +
              this.Game.AwayTeam.TeamSeason +
              " " +
              this.Game.AwayTeam.TeamName +
              " beat the " +
              this.Game.HomeTeam.TeamSeason +
              " " +
              this.Game.HomeTeam.TeamName +
              " " +
              this.Game.AwayTeamRuns +
              " to " +
              this.Game.HomeTeamRuns;
          }

          this.toastr.success(msg, "Game Over!", {
            timeOut: 0,
            extendedTimeOut: 0,
            positionClass: position,
            messageClass: "toast-message",
          });

          this.Game.PlayByPlays.push(msg);
          this.Game.IsGameInProgress = false;

          this.ClearTimers();
          localStorage.clear();
        } else {
          this.Game.CurrentInning.IsBottomOfInning = true;
          this.Game.RunnerOnFirst = null;
          this.Game.RunnerOnSecond = null;
          this.Game.RunnerOnThird = null;
          this.Game.RunnersWhoScoredOnPlay = [];
          this.Game.CurrentInning.HomeRunsScored = 0;
          this.Game.NewAtBat();
        }
      } else {
        this.Game.NewAtBat();
      }
    }
  }

  DrawThrowFromLeftFieldToHome() {
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.leftFielderX + this.playerFieldImgAvatarWidth / 2,
      this.leftFielderY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.bezierCurveTo(
      this.leftFielderX + this.playerFieldImgAvatarWidth / 2,
      this.leftFielderY + this.playerFieldImgAvatarHeight / 2,
      this.leftFielderX + 75,
      this.leftFielderY - 50,
      this.homePlateX,
      this.homePlateY
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  DrawThrowFromCenterFieldToHome() {
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.centerFielderX + this.playerFieldImgAvatarWidth / 2,
      this.centerFielderY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.bezierCurveTo(
      this.centerFielderX + this.playerFieldImgAvatarWidth / 2,
      this.centerFielderY + this.playerFieldImgAvatarHeight / 2,
      this.centerFielderX - 15,
      this.centerFielderY - 20,
      this.homePlateX,
      this.homePlateY
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  DrawThrowFromRightFieldToHome() {
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.rightFielderX + this.playerFieldImgAvatarWidth / 2,
      this.rightFielderY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.bezierCurveTo(
      this.rightFielderX + this.playerFieldImgAvatarWidth / 2,
      this.rightFielderY + this.playerFieldImgAvatarHeight / 2,
      this.rightFielderX - 15,
      this.rightFielderY - 20,
      this.homePlateX,
      this.homePlateY
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  SetPlayingField() {
    this.canvas = <HTMLCanvasElement>document.getElementById("ballparkCanvas");
    this.ctx = this.canvas.getContext("2d");

    let img = new Image();
    img.src = "../assets/images/GenericField2.png";
    img.onload = () => {
      this.ctx.drawImage(img, 0, 0, this.canvasWidth, this.canvasHeight);

      this.timers.push(
        setTimeout(() => {
          this.DrawOuts();
          this.SetDefensivePlayers();
          this.DrawOffensivePlayers();
        }, 100)
      );
    };
  }

  DrawOuts() {
    //var canvas = document.getElementById('myCanvas');
    //var context = canvas.getContext('2d');
    let centerX: number = 100;
    let centerY: number = 570;
    let radius = 5;
    let outs = this.Game.CurrentInning.IsBottomOfInning
      ? this.Game.CurrentInning.HomeOuts
      : this.Game.CurrentInning.AwayOuts;
    for (let i = 1; i <= outs; i++) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = "white";
      this.ctx.fill();
      this.ctx.lineWidth = 5;
      this.ctx.strokeStyle = "white";
      this.ctx.stroke();
      centerX += 20;
    }

    if (outs > 0) {
      this.ctx.font = "14pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText("OUTS", 110, 550);
    }
  }

  SetDefensivePlayers() {
    this.DrawCatcher();
    this.DrawPitcher();
    this.DrawFirstBasemen();
    this.DrawSecondBasemen();
    this.DrawShortstop();
    this.DrawThirdBasemen();
    this.DrawLeftfielder();
    this.DrawCenterfielder();
    this.DrawRightfielder();
  }

  DrawOffensivePlayers() {
    this.DrawHitterOnHomeDeck();
    this.DrawHitterOnAwayDeck();
    this.DrawBatter();
    this.DrawRunnerOnFirst();
    this.DrawRunnerOnSecond();
    this.DrawRunnerOnThird();
  }

  DrawBatter() {
    let img = new Image();
    let color = "#00004E";
    img.src = this.Game.CurrentAtBat.Batter.PlayerImageURL;
    img.title = this.Game.CurrentAtBat.Batter.Name;
    if (this.Game.CurrentInning.IsBottomOfInning) {
      color = "#B30000";
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    if (
      this.Game.CurrentAtBat.Batter.HittingSeasonStats.player.bats &&
      this.Game.CurrentAtBat.Batter.HittingSeasonStats.player.bats.toLowerCase() ==
        "r"
    ) {
      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.rightHandedBatterX,
          this.rightHandedBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.rightHandedBatterX,
          this.rightHandedBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          img.title,
          this.rightHandedBatterX + this.playerFieldImgAvatarWidth / 2,
          this.rightHandedBatterY - 5
        );

        this.DrawBatterImgData(img);
      };
    } else if (
      this.Game.CurrentAtBat.Batter.HittingSeasonStats.player.bats &&
      this.Game.CurrentAtBat.Batter.HittingSeasonStats.player.bats.toLowerCase() ==
        "l"
    ) {
      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.leftHandedBatterX,
          this.leftHandedBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.leftHandedBatterX,
          this.leftHandedBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          img.title,
          this.leftHandedBatterX + this.playerFieldImgAvatarWidth / 2,
          this.leftHandedBatterY - 5
        );

        this.DrawBatterImgData(img);
      };
    } else {
      //TODO - switch sides based on current pitcher

      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.leftHandedBatterX,
          this.leftHandedBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.leftHandedBatterX,
          this.leftHandedBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          img.title,
          this.leftHandedBatterX + this.playerFieldImgAvatarWidth / 2,
          this.leftHandedBatterY - 5
        );

        this.DrawBatterImgData(img);
      };
    }
  }

  private DrawBatterImgData(img: HTMLImageElement) {
    let color = "#00004E";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      color = "#B30000";
    }

    this.ctx.font = "18pt Calibri";
    this.ctx.textAlign = "right";
    this.ctx.fillStyle = "white";
    this.ctx.fillText(
      "BATTER",
      1010 + (this.playerFieldImgAvatarWidth * 3) / 2,
      625
    );
    this.ctx.fillText(
      img.title,
      1010 + (this.playerFieldImgAvatarWidth * 3) / 2,
      650
    );
    this.ctx.fillText(
      this.Game.CurrentAtBat.Batter.HittingSeasonStats.season + " STATS",
      1010 + (this.playerFieldImgAvatarWidth * 3) / 2,
      690
    );

    this.ctx.fillText(
      this.FormatPct(this.Game.CurrentAtBat.Batter.HittingSeasonStats.avg) +
        " " +
        this.Game.CurrentAtBat.Batter.HittingSeasonStats.hr +
        "HR " +
        this.Game.CurrentAtBat.Batter.HittingSeasonStats.rbi +
        "RBI",
      1010 + (this.playerFieldImgAvatarWidth * 3) / 2,
      715
    );

    //Draw Current Batter Info
    this.ctx.beginPath();
    this.ctx.rect(
      1080,
      600,
      this.playerFieldImgAvatarWidth * 2,
      this.playerFieldImgAvatarHeight * 2
    );
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.lineWidth = 4;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
    this.ctx.drawImage(
      img,
      1080,
      600,
      this.playerFieldImgAvatarWidth * 2,
      this.playerFieldImgAvatarHeight * 2
    );
  }

  private FormatPct(pct: number): string {
    //   let str = pct.toString();
    //  let result = str.replace(/^0+([^\d])/, "$1");
    return this.battingAvgPipe.transform(pct);
  }

  DrawRunnerOnFirst() {
    if (this.Game.RunnerOnFirst) {
      let img = new Image();
      let color = "#00004E";
      img.src = this.Game.RunnerOnFirst.PlayerImageURL;
      img.title = this.Game.RunnerOnFirst.Name;

      if (this.Game.CurrentInning.IsBottomOfInning) {
        color = "#B30000";
      }

      img.onerror = function () {
        img.src = "../assets/images/emptyHeadshot.jpeg";
      };

      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.firstBaseX,
          this.firstBaseY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.firstBaseX,
          this.firstBaseY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "gray";
        this.ctx.fillText(
          img.title,
          this.firstBaseX + this.playerFieldImgAvatarWidth / 2,
          this.firstBaseY - 5
        );
      };
    }
  }

  DrawRunnerOnSecond() {
    if (this.Game.RunnerOnSecond) {
      let img = new Image();
      let color = "#00004E";
      img.src = this.Game.RunnerOnSecond.PlayerImageURL;
      img.title = this.Game.RunnerOnSecond.Name;

      if (this.Game.CurrentInning.IsBottomOfInning) {
        color = "#B30000";
      }

      img.onerror = function () {
        img.src = "../assets/images/emptyHeadshot.jpeg";
      };

      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.secondBaseX,
          this.secondBaseY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.secondBaseX,
          this.secondBaseY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          img.title,
          this.secondBaseX + this.playerFieldImgAvatarWidth / 2,
          this.secondBaseY - 5
        );
      };
    }
  }

  DrawRunnerOnThird() {
    if (this.Game.RunnerOnThird) {
      let img = new Image();
      let color = "#00004E";
      img.src = this.Game.RunnerOnThird.PlayerImageURL;
      img.title = this.Game.RunnerOnThird.Name;

      if (this.Game.CurrentInning.IsBottomOfInning) {
        color = "#B30000";
      }

      img.onerror = function () {
        img.src = "../assets/images/emptyHeadshot.jpeg";
      };

      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.thirdBaseX,
          this.thirdBaseY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.thirdBaseX,
          this.thirdBaseY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "gray";
        this.ctx.fillText(
          img.title,
          this.thirdBaseX + this.playerFieldImgAvatarWidth / 2,
          this.thirdBaseY - 5
        );
      };
    }
  }

  DrawHitterOnHomeDeck() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.HomeTeam.NextBatter.PlayerImageURL;
      img.title = this.Game.HomeTeam.NextBatter.Name;

      img.onerror = function () {
        img.src = "../assets/images/emptyHeadshot.jpeg";
      };

      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.homeOnDeckBatterX,
          this.homeOnDeckBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.homeOnDeckBatterX,
          this.homeOnDeckBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          img.title,
          this.homeOnDeckBatterX + this.playerFieldImgAvatarWidth / 2,
          this.homeOnDeckBatterY - 5
        );
      };
    }
  }

  DrawHitterOnAwayDeck() {
    let img = new Image();
    let color = "#00004E";
    if (!this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.NextBatter.PlayerImageURL;
      img.title = this.Game.AwayTeam.NextBatter.Name;

      img.onerror = function () {
        img.src = "../assets/images/emptyHeadshot.jpeg";
      };

      img.onload = () => {
        this.ctx.beginPath();
        this.ctx.rect(
          this.awayOnDeckBatterX,
          this.awayOnDeckBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.drawImage(
          img,
          this.awayOnDeckBatterX,
          this.awayOnDeckBatterY,
          this.playerFieldImgAvatarWidth,
          this.playerFieldImgAvatarHeight
        );

        this.ctx.font = "8pt Calibri";
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
          img.title,
          this.awayOnDeckBatterX + this.playerFieldImgAvatarWidth / 2,
          this.awayOnDeckBatterY - 5
        );
      };
    }
  }

  DrawPitcher() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.Pitcher.PlayerImageURL;
      img.title = this.Game.AwayTeam.Pitcher.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.Pitcher.PlayerImageURL;
      img.title = this.Game.HomeTeam.Pitcher.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.pitcherX,
        this.pitcherY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.pitcherX,
        this.pitcherY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.pitcherX + this.playerFieldImgAvatarWidth / 2,
        this.pitcherY - 5
      );

      //Draw Current Pitcher Info
      this.ctx.beginPath();
      this.ctx.rect(
        80,
        600,
        this.playerFieldImgAvatarWidth * 2,
        this.playerFieldImgAvatarHeight * 2
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
      this.ctx.drawImage(
        img,
        80,
        600,
        this.playerFieldImgAvatarWidth * 2,
        this.playerFieldImgAvatarHeight * 2
      );

      this.ctx.font = "18pt Calibri";
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        "PITCHER",
        110 + (this.playerFieldImgAvatarWidth * 3) / 2,
        625
      );
      this.ctx.fillText(
        img.title,
        110 + (this.playerFieldImgAvatarWidth * 3) / 2,
        650
      );
      this.ctx.fillText(
        this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.season + " STATS",
        110 + (this.playerFieldImgAvatarWidth * 3) / 2,
        690
      );

      this.ctx.fillText(
        this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.wins +
          "-" +
          this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.losses +
          " " +
          this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.era +
          "ERA " +
          this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.whip +
          "WHIP",
        110 + (this.playerFieldImgAvatarWidth * 3) / 2,
        715
      );

      //Draw pitcher tired percentage
      let pctLeft =
        this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.StartingPX /
        this.Game.CurrentAtBat.Pitcher.PitchingSeasonStats.PX;
      this.ctx.beginPath();
      this.ctx.rect(80, 725, 325, 15);
      this.ctx.fillStyle = "black";
      this.ctx.fill();

      let left = 325 * pctLeft;
      this.ctx.beginPath();
      this.ctx.rect(80, 725, left, 15);
      if (left > 292) {
        var grd = this.ctx.createLinearGradient(0, 0, left, 15);
        // dark green
        grd.addColorStop(0, "#006400");

        // light green
        grd.addColorStop(1, "#00e400");

        this.ctx.fillStyle = grd;
      } else {
        var grd = this.ctx.createLinearGradient(0, 0, left, 15);

        // dark red
        grd.addColorStop(0, "#B30000");

        // light red
        grd.addColorStop(1, "#ff9a9a");

        this.ctx.fillStyle = grd;
      }
      this.ctx.fill();
    };
  }

  DrawCatcher() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.Catcher.PlayerImageURL;
      img.title = this.Game.AwayTeam.Catcher.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.Catcher.PlayerImageURL;
      img.title = this.Game.HomeTeam.Catcher.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.catcherX,
        this.catcherY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.catcherX,
        this.catcherY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "gray";
      this.ctx.fillText(
        img.title,
        this.catcherX + this.playerFieldImgAvatarWidth / 2,
        this.catcherY - 5
      );
    };
  }

  DrawFirstBasemen() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.FirstBaseman.PlayerImageURL;
      img.title = this.Game.AwayTeam.FirstBaseman.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.FirstBaseman.PlayerImageURL;
      img.title = this.Game.HomeTeam.FirstBaseman.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.firstBasemanX,
        this.firstBasemanY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.firstBasemanX,
        this.firstBasemanY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.firstBasemanX + this.playerFieldImgAvatarWidth / 2,
        this.firstBasemanY - 5
      );
    };
  }

  DrawSecondBasemen() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.SecondBaseman.PlayerImageURL;
      img.title = this.Game.AwayTeam.SecondBaseman.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.SecondBaseman.PlayerImageURL;
      img.title = this.Game.HomeTeam.SecondBaseman.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.secondBasemanX,
        this.secondBasemanY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.secondBasemanX,
        this.secondBasemanY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.secondBasemanX + this.playerFieldImgAvatarWidth / 2,
        this.secondBasemanY - 5
      );
    };
  }

  DrawThirdBasemen() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.ThirdBaseman.PlayerImageURL;
      img.title = this.Game.AwayTeam.ThirdBaseman.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.ThirdBaseman.PlayerImageURL;
      img.title = this.Game.HomeTeam.ThirdBaseman.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.thirdBasemanX,
        this.thirdBasemanY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.thirdBasemanX,
        this.thirdBasemanY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.thirdBasemanX + this.playerFieldImgAvatarWidth / 2,
        this.thirdBasemanY - 5
      );
    };
  }

  DrawShortstop() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.Shortstop.PlayerImageURL;
      img.title = this.Game.AwayTeam.Shortstop.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.Shortstop.PlayerImageURL;
      img.title = this.Game.HomeTeam.Shortstop.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.shortstopX,
        this.shortstopY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.shortstopX,
        this.shortstopY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.shortstopX + this.playerFieldImgAvatarWidth / 2,
        this.shortstopY - 5
      );
    };
  }

  DrawLeftfielder() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.LeftFielder.PlayerImageURL;
      img.title = this.Game.AwayTeam.LeftFielder.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.LeftFielder.PlayerImageURL;
      img.title = this.Game.HomeTeam.LeftFielder.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.leftFielderX,
        this.leftFielderY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.leftFielderX,
        this.leftFielderY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.leftFielderX + this.playerFieldImgAvatarWidth / 2,
        this.leftFielderY - 5
      );
    };
  }

  DrawRightfielder() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.RightFielder.PlayerImageURL;
      img.title = this.Game.AwayTeam.RightFielder.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.RightFielder.PlayerImageURL;
      img.title = this.Game.HomeTeam.RightFielder.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.rightFielderX,
        this.rightFielderY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.rightFielderX,
        this.rightFielderY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.rightFielderX + this.playerFieldImgAvatarWidth / 2,
        this.rightFielderY - 5
      );
    };
  }

  DrawCenterfielder() {
    let img = new Image();
    let color = "#B30000";
    if (this.Game.CurrentInning.IsBottomOfInning) {
      img.src = this.Game.AwayTeam.CenterFielder.PlayerImageURL;
      img.title = this.Game.AwayTeam.CenterFielder.Name;
      color = "#00004E";
    } else {
      img.src = this.Game.HomeTeam.CenterFielder.PlayerImageURL;
      img.title = this.Game.HomeTeam.CenterFielder.Name;
    }

    img.onerror = function () {
      img.src = "../assets/images/emptyHeadshot.jpeg";
    };

    img.onload = () => {
      this.ctx.beginPath();
      this.ctx.rect(
        this.centerFielderX,
        this.centerFielderY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = color;
      this.ctx.stroke();

      this.ctx.drawImage(
        img,
        this.centerFielderX,
        this.centerFielderY,
        this.playerFieldImgAvatarWidth,
        this.playerFieldImgAvatarHeight
      );

      this.ctx.font = "8pt Calibri";
      this.ctx.textAlign = "center";
      this.ctx.fillStyle = "white";
      this.ctx.fillText(
        img.title,
        this.centerFielderX + this.playerFieldImgAvatarWidth / 2,
        this.centerFielderY - 5
      );
    };
  }

  BatterWalked() {
    //TODO
  }

  groundBallSingleLeft1X: number = 370 * this.screenPctAdj;
  groundBallSingleLeft1Y: number = 725 * this.screenPctAdj;

  GroundBallSingleLeft1() {
    this.GroundBallHit(
      this.groundBallSingleLeft1X,
      this.groundBallSingleLeft1Y,
      "Single down the left field line!"
    );
  }

  groundBallHitLeft2X: number = 639 * this.screenPctAdj;
  groundBallHitLeft2Y: number = 710 * this.screenPctAdj;

  GroundBallSingleLeft2() {
    this.GroundBallHit(
      this.groundBallHitLeft2X,
      this.groundBallHitLeft2Y,
      "Single to left field!"
    );
  }

  groundBallSingleCenter1X: number = 875 * this.screenPctAdj;
  groundBallSingleCenter1Y: number = 680 * this.screenPctAdj;

  GroundBallSingleCenter1() {
    this.GroundBallHit(
      this.groundBallSingleCenter1X,
      this.groundBallSingleCenter1Y,
      "Base Hit to center!"
    );
  }

  groundBallSingleCenter2X: number = 1025 * this.screenPctAdj;
  groundBallSingleCenter2Y: number = 680 * this.screenPctAdj;

  GroundBallSingleCenter2() {
    this.GroundBallHit(
      this.groundBallSingleCenter2X,
      this.groundBallSingleCenter2Y,
      "Single to center field!"
    );
  }

  groundBallSingleRight1X: number = 1250 * this.screenPctAdj;
  groundBallSingleRight1Y: number = 650 * this.screenPctAdj;

  GroundBallSingleRight1() {
    this.GroundBallHit(
      this.groundBallSingleRight1X,
      this.groundBallSingleRight1Y,
      "Single down the right field line!"
    );
  }

  groundBallSingleRight2X: number = 1520 * this.screenPctAdj;
  groundBallSingleRight2Y: number = 720 * this.screenPctAdj;

  GroundBallSingleRight2() {
    this.GroundBallHit(
      this.groundBallSingleRight2X,
      this.groundBallSingleRight2Y,
      "Single to right field!"
    );
  }

  flyBallDoubleLeft1cp1X: number = 400 * this.screenPctAdj;
  flyBallDoubleLeft1cp1Y: number = 200 * this.screenPctAdj;
  flyBallDoubleLeft1cp2X: number = 250 * this.screenPctAdj;
  flyBallDoubleLeft1cp2Y: number = 300 * this.screenPctAdj;

  FlyBallDoubleLeft1() {
    this.FlyBallHit(
      this.flyBallDoubleLeft1cp1X,
      this.flyBallDoubleLeft1cp1Y,
      this.flyBallDoubleLeft1cp2X,
      this.flyBallDoubleLeft1cp2Y,
      this.leftFielderX - 180,
      this.leftFielderY + 30
    );
  }

  flyBallDoubleLeftCenter1cp1X: number = 700 * this.screenPctAdj;
  flyBallDoubleLeftCenter1cp1Y: number = 0;
  flyBallDoubleLeftCenter1cp2X: number = 600 * this.screenPctAdj;
  flyBallDoubleLeftCenter1cp2Y: number = 0;
  FlyBallDoubleLeftCenter1() {
    this.FlyBallHit(
      this.flyBallDoubleLeftCenter1cp1X,
      this.flyBallDoubleLeftCenter1cp1Y,
      this.flyBallDoubleLeftCenter1cp2X,
      this.flyBallDoubleLeftCenter1cp2Y,
      400,
      this.leftFielderY - 25
    );
  }

  groundBallDoubleLeft1X: number = 370 * this.screenPctAdj;
  groundBallDoubleLeft1Y: number = 725 * this.screenPctAdj;

  GroundBallDoubleLeft1() {
    this.GroundBallHit(
      this.groundBallDoubleLeft1X,
      this.groundBallDoubleLeft1Y,
      "Double down the left field line!"
    );
  }

  flyBallDoubleLeft2cp1X: number = 675 * this.screenPctAdj;
  flyBallDoubleLeft2cp1Y: number = 420 * this.screenPctAdj;
  flyBallDoubleLeft2cp2X: number = 575 * this.screenPctAdj;
  flyBallDoubleLeft2cp2Y: number = 330 * this.screenPctAdj;

  FlyBallDoubleLeft2() {
    this.FlyBallHit(
      this.flyBallDoubleLeft2cp1X,
      this.flyBallDoubleLeft2cp1Y,
      this.flyBallDoubleLeft2cp2X,
      this.flyBallDoubleLeft2cp2Y,
      this.leftFielderX - 30,
      this.leftFielderY
    );
  }

  flyBallDoubleLeftCentercp1X: number = 780 * this.screenPctAdj;
  flyBallDoubleLeftCentercp1Y: number = 30 * this.screenPctAdj;
  flyBallDoubleLeftCenter2cp2X: number = 780 * this.screenPctAdj;
  flyBallDoubleLeftCentercp2Y: number = 400 * this.screenPctAdj;

  FlyBallDoubleLeftCenter() {
    this.FlyBallHit(
      this.flyBallDoubleLeftCentercp1X,
      this.flyBallDoubleLeftCentercp1Y,
      this.flyBallDoubleLeftCenter2cp2X,
      this.flyBallDoubleLeftCentercp2Y,
      (this.leftFielderX + this.centerFielderX) / 2,
      this.centerFielderY
    );
  }

  flyBallDoubleCentercp1X: number = 980 * this.screenPctAdj;
  flyBallDoubleCentercp1Y: number = 0 * this.screenPctAdj;
  flyBallDoubleCenter2cp2X: number = 980 * this.screenPctAdj;
  flyBallDoubleCentercp2Y: number = 420 * this.screenPctAdj;

  FlyBallDoubleCenter() {
    this.FlyBallHit(
      this.flyBallDoubleCentercp1X,
      this.flyBallDoubleCentercp1Y,
      this.flyBallDoubleCenter2cp2X,
      this.flyBallDoubleCentercp2Y,
      this.centerFielderX + 30,
      this.centerFielderY - 5
    );
  }

  flyBallDoubleRightCentercp1X: number = 1075 * this.screenPctAdj;
  flyBallDoubleRightCentercp1Y: number = 10 * this.screenPctAdj;
  flyBallDoubleRightCenter2cp2X: number = 1150 * this.screenPctAdj;
  flyBallDoubleRightCentercp2Y: number = 450 * this.screenPctAdj;

  FlyBallDoubleRightCenter() {
    this.FlyBallHit(
      this.flyBallDoubleRightCentercp1X,
      this.flyBallDoubleRightCentercp1Y,
      this.flyBallDoubleRightCenter2cp2X,
      this.flyBallDoubleRightCentercp2Y,
      (this.rightFielderX + this.centerFielderX + 50) / 2,
      this.centerFielderY + 10
    );
  }

  flyBallDoubleRightcp1X: number = 1550 * this.screenPctAdj;
  flyBallDoubleRightcp1Y: number = 10 * this.screenPctAdj;
  flyBallDoubleRight2cp2X: number = 1500 * this.screenPctAdj;
  flyBallDoubleRightcp2Y: number = 720 * this.screenPctAdj;

  FlyBallDoubleRight1() {
    this.FlyBallHit(
      this.flyBallDoubleRightcp1X,
      this.flyBallDoubleRightcp1Y,
      this.flyBallDoubleRight2cp2X,
      this.flyBallDoubleRightcp2Y,
      this.rightFielderX + 140,
      this.rightFielderY + 20
    );
  }

  GetCurrentNumberOfOuts() {
    if (this.Game.CurrentInning.IsBottomOfInning) {
      return this.Game.CurrentInning.HomeOuts;
    } else {
      return this.Game.CurrentInning.AwayOuts;
    }
  }

  //Outs
  GroundBallOutToThird() {
    this.PlayBatHittingBallSound();

    var numberOfOuts = this.GetCurrentNumberOfOuts();
    if (numberOfOuts == 2) {
      this.ThirdToFirstSingleGroundOut(); //Just get the regular out
    } else {
      if (numberOfOuts == 0) {
        if (this.Game.RunnerOnThird) {
        }

        if (this.Game.RunnerOnSecond) {
        }

        if (this.Game.RunnerOnFirst) {
        }
      } else if (numberOfOuts == 1) {
        if (this.Game.RunnerOnFirst) {
          this.AttemptFiveFourThreeDoublePlay();
        } else {
          this.ThirdToFirstSingleGroundOut();
        }
      }
    }
  }

  ThirdToSecondToFirstDoublePlayGroundOut() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(
      this.thirdBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
      this.thirdBasemanY + this.playerFieldImgAvatarHeight / 2 + 15
    );
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();

    this.timers.push(
      setTimeout(() => {
        this.ctx.moveTo(
          this.thirdBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
          this.thirdBasemanY + this.playerFieldImgAvatarHeight / 2 + 15
        );

        this.ctx.lineTo(
          this.secondBaseX + this.playerFieldImgAvatarWidth / 2,
          this.secondBaseY + this.playerFieldImgAvatarHeight / 2
        );

        this.ctx.moveTo(
          this.secondBaseX + this.playerFieldImgAvatarWidth / 2 + 15,
          this.secondBaseY + this.playerFieldImgAvatarHeight / 2 + 15
        );

        this.ctx.lineWidth = 2;
        this.ctx.lineTo(
          this.firstBaseX + this.playerFieldImgAvatarWidth / 2,
          this.firstBaseY + this.playerFieldImgAvatarHeight / 2
        );
        // line color
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }, 200)
    );
  }

  ThirdToFirstSingleGroundOut() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(
      this.thirdBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
      this.thirdBasemanY + this.playerFieldImgAvatarHeight / 2 + 15
    );
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();

    this.timers.push(
      setTimeout(() => {
        this.ctx.beginPath();
        this.ctx.moveTo(
          this.thirdBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
          this.thirdBasemanY + this.playerFieldImgAvatarHeight / 2 + 15
        );

        this.ctx.lineWidth = 2;
        this.ctx.lineTo(
          this.firstBaseX + this.playerFieldImgAvatarWidth / 2,
          this.firstBaseY + this.playerFieldImgAvatarHeight / 2
        );
        // line color
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }, 200)
    );
  }

  AttemptFiveFourThreeTriplePlay() {}

  AttemptFiveFourThreeDoublePlay() {
    //Drawing part
    this.ThirdToSecondToFirstDoublePlayGroundOut();

    //Actual Outcome
    let diceRoll = this.GenerateRandomNumber(1, 100);
    if (diceRoll > 90) {
      //Both Safe
      if (this.Game.RunnerOnThird) {
        //Player from third scores
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnerOnThird = this.Game.RunnerOnSecond;
      }

      this.Game.RunnerOnSecond = this.Game.RunnerOnFirst;
      this.Game.RunnerOnFirst = this.Game.CurrentAtBat.Batter;
      this.newOuts = 0;

      this.showInfo("All baserunners safe after double-play attempt.");
    } else if (diceRoll > 76) {
      //Out at second only
      if (this.Game.RunnerOnThird) {
        //Player from third scores
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnerOnThird = this.Game.RunnerOnSecond;
      }

      this.Game.RunnerOnSecond = null;
      this.Game.RunnerOnFirst = this.Game.CurrentAtBat.Batter;
      this.newOuts = 1;

      this.showInfo(
        "Baserunner at second is out and baserunner at first is safe after double-play attempt."
      );
    } else {
      //Both out
      this.Game.RunnerOnSecond = null;
      this.Game.RunnerOnFirst = null;
      this.newOuts = 2;
      this.showError(
        "Twin-killing! 5-4-3 Double-play. Both baserunners are out!"
      );
    }
  }

  AttemptFourSixThreeDoublePlay() {}

  AttemptOneTwoThreeDoublePlay() {}

  GroundBallOutToShort() {
    this.PlayBatHittingBallSound();

    var numberOfOuts = this.GetCurrentNumberOfOuts();
    if (numberOfOuts == 2) {
      this.ShortToFirstSingleGroundOut(); //Just get the regular out
    } else {
      if (numberOfOuts == 0) {
        if (this.Game.RunnerOnThird) {
        }

        if (this.Game.RunnerOnSecond) {
        }

        if (this.Game.RunnerOnFirst) {
        }
      } else if (numberOfOuts == 1) {
        if (this.Game.RunnerOnFirst) {
          this.AttemptSixFourThreeDoublePlay();
        } else {
          this.ShortToFirstSingleGroundOut();
        }
      }
    }
  }

  ShortToSecondToFirstDoublePlayGroundOut(){
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(this.shortstopX + (this.playerFieldImgAvatarWidth / 2) + 15, this.shortstopY + (this.playerFieldImgAvatarHeight / 2) + 15);
    // line color
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();

    setTimeout(() => {

      this.ctx.moveTo(this.shortstopX + (this.playerFieldImgAvatarWidth / 2) + 15, this.shortstopY + (this.playerFieldImgAvatarHeight / 2) + 15);

      this.ctx.lineTo(this.secondBaseX + (this.playerFieldImgAvatarWidth / 2), this.secondBaseY + (this.playerFieldImgAvatarHeight / 2));

      this.ctx.moveTo(this.secondBaseX + (this.playerFieldImgAvatarWidth / 2) + 15, this.secondBaseY + (this.playerFieldImgAvatarHeight / 2) + 15);

      this.ctx.lineWidth = 2;
      this.ctx.lineTo(this.firstBaseX + (this.playerFieldImgAvatarWidth / 2), this.firstBaseY + (this.playerFieldImgAvatarHeight / 2));
      // line color
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
    }, 200);
  }

  AttemptSixFourThreeDoublePlay(){
    //Drawing part
    this.ShortToSecondToFirstDoublePlayGroundOut();

    //Actual Outcome
    let diceRoll = this.GenerateRandomNumber(1, 100);
    if (diceRoll > 90) {
      //Both Safe
      if (this.Game.RunnerOnThird) {
        //Player from third scores
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnerOnThird = this.Game.RunnerOnSecond;
      }

      this.Game.RunnerOnSecond = this.Game.RunnerOnFirst;
      this.Game.RunnerOnFirst = this.Game.CurrentAtBat.Batter;
      this.newOuts = 0;

      this.showInfo("All baserunners safe after double-play attempt.");
    }
    else if (diceRoll > 76) {
      //Out at second only
      if (this.Game.RunnerOnThird) {
        //Player from third scores
        this.Game.RunnersWhoScoredOnPlay.push(this.Game.RunnerOnThird);
        this.Game.RunnerOnThird = null;
      }

      if (this.Game.RunnerOnSecond) {
        this.Game.RunnerOnThird = this.Game.RunnerOnSecond;
      }

      this.Game.RunnerOnSecond = null;
      this.Game.RunnerOnFirst = this.Game.CurrentAtBat.Batter;
      this.newOuts = 1;

      this.showInfo("Baserunner at second is out and baserunner at first is safe after double-play attempt.");
    }
    else {
      //Both out
      this.Game.RunnerOnSecond = null;
      this.Game.RunnerOnFirst = null;
      this.newOuts = 2;
      this.showError("Twin-killing! 6-4-3 Double-play. Both baserunners are out!");
    }
    }

  ShortToFirstSingleGroundOut(){
  this.PlayBatHittingBallSound();

    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(this.shortstopX + (this.playerFieldImgAvatarWidth / 2) + 15, this.shortstopY + (this.playerFieldImgAvatarHeight / 2) + 15);
    // line color
    this.ctx.strokeStyle = 'white';
    this.ctx.stroke();

    setTimeout(() => {
      this.ctx.beginPath();
      this.ctx.moveTo(this.shortstopX + (this.playerFieldImgAvatarWidth / 2) + 15, this.shortstopY + (this.playerFieldImgAvatarHeight / 2) + 15);

      this.ctx.lineWidth = 2;
      this.ctx.lineTo(this.firstBaseX + (this.playerFieldImgAvatarWidth / 2), this.firstBaseY + (this.playerFieldImgAvatarHeight / 2));
      // line color
      this.ctx.strokeStyle = 'white';
      this.ctx.stroke();
    }, 200);
  }




  GroundBallOutToSecond() {
    this.PlayBatHittingBallSound();

    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(
      this.secondBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
      this.secondBasemanY + this.playerFieldImgAvatarHeight / 2 + 15
    );
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();

    this.timers.push(
      setTimeout(() => {
        this.ctx.beginPath();
        this.ctx.moveTo(
          this.secondBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
          this.secondBasemanY + this.playerFieldImgAvatarHeight / 2 + 15
        );

        this.ctx.lineWidth = 2;
        this.ctx.lineTo(
          this.firstBaseX + this.playerFieldImgAvatarWidth / 2,
          this.firstBaseY + this.playerFieldImgAvatarHeight / 2
        );
        // line color
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }, 200)
    );
  }

  GroundBallOutToFirst() {
    this.PlayBatHittingBallSound();

    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(
      this.firstBasemanX + this.playerFieldImgAvatarWidth / 2 + 15,
      this.firstBasemanY + this.playerFieldImgAvatarHeight / 2 + 30
    );
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  GroundBallOutToPitcher() {
    this.PlayBatHittingBallSound();

    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(
      this.pitcherX + this.playerFieldImgAvatarWidth / 2,
      this.pitcherY + this.playerFieldImgAvatarHeight / 2 + 15
    );
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();

    this.timers.push(
      setTimeout(() => {
        this.ctx.beginPath();
        this.ctx.moveTo(
          this.pitcherX + this.playerFieldImgAvatarWidth / 2,
          this.pitcherY + this.playerFieldImgAvatarHeight / 2 + 15
        );

        this.ctx.lineWidth = 2;
        this.ctx.lineTo(
          this.firstBaseX + this.playerFieldImgAvatarWidth / 2,
          this.firstBaseY + this.playerFieldImgAvatarHeight / 2
        );
        // line color
        this.ctx.strokeStyle = "white";
        this.ctx.stroke();
      }, 200)
    );
  }

  //Line Drive Outs
  LineOutToLeft() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.leftFielderX) / 2,
      this.leftFielderY + 20,
      this.leftFielderX + this.playerFieldImgAvatarWidth / 2,
      this.leftFielderY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToCenter() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.centerFielderX) / 2,
      this.centerFielderY + 20,
      this.centerFielderX + this.playerFieldImgAvatarWidth / 2,
      this.centerFielderY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToRight() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.rightFielderX) / 2,
      this.rightFielderY + 20,
      this.rightFielderX + this.playerFieldImgAvatarWidth / 2,
      this.rightFielderY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToThird() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.thirdBasemanX) / 2,
      this.thirdBasemanY + 20,
      this.thirdBasemanX + this.playerFieldImgAvatarWidth / 2,
      this.thirdBasemanY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToShort() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.shortstopX) / 2,
      this.shortstopY + 20,
      this.shortstopX + this.playerFieldImgAvatarWidth / 2,
      this.shortstopY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToSecond() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.secondBasemanX) / 2,
      this.secondBasemanY + 20,
      this.secondBasemanX + this.playerFieldImgAvatarWidth / 2,
      this.secondBasemanY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToFirst() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.firstBasemanX) / 2,
      this.firstBasemanY + 20,
      this.firstBasemanX + this.playerFieldImgAvatarWidth / 2,
      this.firstBasemanY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  LineOutToPitcher() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(
      this.homePlateX,
      this.homePlateY,
      (this.homePlateX + this.pitcherX) / 2,
      this.pitcherY + 20,
      this.pitcherX + this.playerFieldImgAvatarWidth / 2,
      this.pitcherY + this.playerFieldImgAvatarHeight / 2
    );
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  flyBallInfieldOut1cp1X: number = 1000 * this.screenPctAdj;
  flyBallInfieldOut1cp1Y: number = 1 * this.screenPctAdj;
  flyBallInfieldOut1cp2X: number = 1120 * this.screenPctAdj;
  flyBallInfieldOut1cp2Y: number = 150 * this.screenPctAdj;
  FlyBallOutToFirst() {
    this.FlyBallHit(
      this.flyBallInfieldOut1cp1X,
      this.flyBallInfieldOut1cp1Y,
      this.flyBallInfieldOut1cp2X,
      this.flyBallInfieldOut1cp2Y,
      (this.rightFielderX + this.centerFielderX + 50) / 2,
      this.shortstopY + 30
    );
  }

  flyBallInfieldOutToSecond1cp1X: number = 925 * this.screenPctAdj;
  flyBallInfieldOutToSecond1cp1Y: number = 1 * this.screenPctAdj;
  flyBallInfieldOutToSecond1cp2X: number = 1050 * this.screenPctAdj;
  flyBallInfieldOutToSecond1cp2Y: number = 150 * this.screenPctAdj;
  FlyBallOutToSecond() {
    this.FlyBallHit(
      this.flyBallInfieldOutToSecond1cp1X,
      this.flyBallInfieldOutToSecond1cp1Y,
      this.flyBallInfieldOutToSecond1cp2X,
      this.flyBallInfieldOutToSecond1cp2Y,
      this.secondBasemanX + 30,
      this.secondBasemanY
    );
  }

  //FlyBallOutToShortstop
  flyBallInfieldOutToShortstop1cp1X: number = 850 * this.screenPctAdj;
  flyBallInfieldOutToShortstop1cp1Y: number = 10 * this.screenPctAdj;
  flyBallInfieldOutToShortstop1cp2X: number = 810 * this.screenPctAdj;
  flyBallInfieldOutToShortstop1cp2Y: number = 150 * this.screenPctAdj;
  FlyBallOutToShortstop() {
    this.FlyBallHit(
      this.flyBallInfieldOutToShortstop1cp1X,
      this.flyBallInfieldOutToShortstop1cp1Y,
      this.flyBallInfieldOutToShortstop1cp2X,
      this.flyBallInfieldOutToShortstop1cp2Y,
      this.shortstopX + 10,
      this.shortstopY
    );
  }

  flyBallInfieldOut2cp1X: number = 750 * this.screenPctAdj;
  flyBallInfieldOut2cp1Y: number = 10 * this.screenPctAdj;
  flyBallInfieldOut2cp2X: number = 710 * this.screenPctAdj;
  flyBallInfieldOut2cp2Y: number = 150 * this.screenPctAdj;
  FlyBallOutToThird() {
    this.FlyBallHit(
      this.flyBallInfieldOut2cp1X,
      this.flyBallInfieldOut2cp1Y,
      this.flyBallInfieldOut2cp2X,
      this.flyBallInfieldOut2cp2Y,
      (this.leftFielderX + this.centerFielderX) / 2,
      this.secondBasemanY + 30
    );
  }

  flyBallOutToLeftFieldcp1X: number = 675 * this.screenPctAdj;
  flyBallOutToLeftFieldcp1Y: number = -100;
  flyBallOutToLeftFieldcp2X: number = 525 * this.screenPctAdj;
  flyBallOutToLeftFieldcp2Y: number = -150;
  FlyBallOutToLeftField() {
    this.FlyBallHit(
      this.flyBallOutToLeftFieldcp1X,
      this.flyBallOutToLeftFieldcp1Y,
      this.flyBallOutToLeftFieldcp2X,
      this.flyBallOutToLeftFieldcp2Y,
      this.leftFielderX + 15,
      this.leftFielderY
    );
  }

  flyBallOutToCenterFieldcp1X: number = 900 * this.screenPctAdj;
  flyBallOutToCenterFieldcp1Y: number = 0;
  flyBallOutToCenterFieldcp2X: number = 900 * this.screenPctAdj;
  flyBallOutToCenterFieldcp2Y: number = -200;
  FlyBallOutToCenterField() {
    this.FlyBallHit(
      this.flyBallOutToCenterFieldcp1X,
      this.flyBallOutToCenterFieldcp1Y,
      this.flyBallOutToCenterFieldcp2X,
      this.flyBallOutToCenterFieldcp2Y,
      this.centerFielderX + 15,
      this.centerFielderY
    );
  }

  flyBallOutToRightFieldcp1X: number = 1275 * this.screenPctAdj;
  flyBallOutToRightFieldcp1Y: number = 0;
  flyBallOutToRightFieldcp2X: number = 1300 * this.screenPctAdj;
  flyBallOutToRightFieldcp2Y: number = -150;
  FlyBallOutToRightField() {
    this.FlyBallHit(
      this.flyBallOutToRightFieldcp1X,
      this.flyBallOutToRightFieldcp1Y,
      this.flyBallOutToRightFieldcp2X,
      this.flyBallOutToRightFieldcp2Y,
      this.rightFielderX + 15,
      this.rightFielderY
    );
  }

  flyBallOutToPitcher1cp1X: number = this.pitcherX - 10;
  flyBallOutToPitcher1cp1Y: number = 10 * this.screenPctAdj;
  flyBallOutToPitcher1cp2X: number = this.pitcherX + 20;
  flyBallOutToPitcher1cp2Y: number = 50 * this.screenPctAdj;
  FlyBallOutToPitcher() {
    this.FlyBallHit(
      this.flyBallOutToPitcher1cp1X,
      this.flyBallOutToPitcher1cp1Y,
      this.flyBallOutToPitcher1cp2X,
      this.flyBallOutToPitcher1cp2Y,
      this.pitcherX + 20,
      this.pitcherY
    );
  }

  flyBallOutToCatcher1cp1X: number = this.pitcherX - 10;
  flyBallOutToCatcher1cp1Y: number = 10 * this.screenPctAdj;
  flyBallOutToCatcher1cp2X: number = this.pitcherX + 20;
  flyBallOutToCatcher1cp2Y: number = 50 * this.screenPctAdj;
  FlyBallOutToCatcher() {
    this.FlyBallHit(
      this.flyBallOutToCatcher1cp1X,
      this.flyBallOutToCatcher1cp1Y,
      this.flyBallOutToCatcher1cp2X,
      this.flyBallOutToCatcher1cp2Y,
      this.catcherX + 20,
      this.catcherY + 30
    );
  }

  BreakingBallRH() {
    this.PlayPitchSound();
  }

  BreakingBallLH() {
    this.PlayPitchSound();
  }

  Pitch() {
    this.ctx.beginPath();
    this.ctx.moveTo(
      this.pitcherX + 20,
      this.pitcherY + this.playerFieldImgAvatarHeight
    );
    this.ctx.lineTo(this.homePlateX, this.homePlateY);
    this.ctx.lineWidth = 3;
    this.ctx.lineCap = "round";
    // line color
    this.ctx.strokeStyle = "lightgray";
    this.ctx.stroke();

    // this.PlayPitchSound();
  }

  GroundBallHit(x: number, y: number, desc: string) {
    // this.SetPlayingField();
    this.PlayBatHittingBallSound();

    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);

    this.ctx.lineWidth = 2;
    this.ctx.lineTo(x, y);
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  FlyBallHit(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number
  ) {
    //   this.SetPlayingField();
    this.PlayBatHittingBallSound();
    //  this.ctx.setLineDash([4, 8]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.homePlateX, this.homePlateY);
    this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
    this.ctx.lineWidth = 2;
    // line color
    this.ctx.strokeStyle = "white";
    this.ctx.stroke();
  }

  ClearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.SetPlayingField();
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  PlayBatHittingBallSound() {
    if (!this.IsSoundMuted) {
      //this.batHittingBallSound.play();
    }
  }

  PlayPitchSound() {
    if (!this.IsSoundMuted) {
      //this.pitchSound.play();
    }
  }

  homerLeftFieldLinecp1X: number = 400 * this.screenPctAdj;
  homerLeftFieldLinecp1Y: number = 10 * this.screenPctAdj;
  homerLeftFieldLinecp2X: number = 250 * this.screenPctAdj;
  homerLeftFieldLinecp2Y: number = 1 * this.screenPctAdj;
  HomerLeftFieldLine() {
    this.FlyBallHit(
      this.homerLeftFieldLinecp1X,
      this.homerLeftFieldLinecp1Y,
      this.homerLeftFieldLinecp2X,
      this.homerLeftFieldLinecp2Y,
      70,
      this.leftFielderY - 30
    );
  }

  longHomerLeftFieldLinecp1X: number = 325 * this.screenPctAdj;
  longHomerLeftFieldLinecp1Y: number = 10 * this.screenPctAdj;
  longHomerLeftFieldLinecp2X: number = 250 * this.screenPctAdj;
  longHomerLeftFieldLinecp2Y: number =
    (this.leftFielderY - 300) * this.screenPctAdj;
  LongHomerLeftFieldLine() {
    this.FlyBallHit(
      this.longHomerLeftFieldLinecp1X,
      this.longHomerLeftFieldLinecp1Y,
      this.longHomerLeftFieldLinecp2X,
      this.longHomerLeftFieldLinecp2Y,
      70,
      this.leftFielderY - 100
    );
  }

  homerLeftFieldcp1X: number = 650 * this.screenPctAdj;
  homerLeftFieldcp1Y: number = 0;
  homerLeftFieldcp2X: number = 550 * this.screenPctAdj;
  homerLeftFieldcp2Y: number = 0;
  HomerLeftField() {
    this.FlyBallHit(
      this.homerLeftFieldcp1X,
      this.homerLeftFieldcp1Y,
      this.homerLeftFieldcp2X,
      this.homerLeftFieldcp2Y,
      225,
      this.leftFielderY - 80
    );
  }

  homerLeftCenterFieldcp1X: number = 650 * this.screenPctAdj;
  homerLeftCenterFieldcp1Y: number = 0;
  homerLeftCenterFieldcp2X: number = 550 * this.screenPctAdj;
  homerLeftCenterFieldcp2Y: number = -150;
  HomerLeftCenterField() {
    this.FlyBallHit(
      this.homerLeftCenterFieldcp1X,
      this.homerLeftCenterFieldcp1Y,
      this.homerLeftCenterFieldcp2X,
      this.homerLeftCenterFieldcp2Y,
      350,
      this.leftFielderY - 90
    );
  }

  homerCenterFieldcp1X: number = 900 * this.screenPctAdj;
  homerCenterFieldcp1Y: number = 0;
  homerCenterFieldcp2X: number = 900 * this.screenPctAdj;
  homerCenterFieldcp2Y: number = -150;
  HomerCenterField() {
    this.FlyBallHit(
      this.homerCenterFieldcp1X,
      this.homerCenterFieldcp1Y,
      this.homerCenterFieldcp2X,
      this.homerCenterFieldcp2Y,
      625,
      this.centerFielderY - 90
    );
  }

  homerRightCenterFieldcp1X: number = 1175 * this.screenPctAdj;
  homerRightCenterFieldcp1Y: number = 0;
  homerRightCenterFieldcp2X: number = 1200 * this.screenPctAdj;
  homerRightCenterFieldcp2Y: number = -150;
  HomerRightCenterField() {
    this.FlyBallHit(
      this.homerRightCenterFieldcp1X,
      this.homerRightCenterFieldcp1Y,
      this.homerRightCenterFieldcp2X,
      this.homerRightCenterFieldcp2Y,
      (this.rightFielderX + this.centerFielderX + 50) / 2 + 50,
      this.centerFielderY - 60
    );
  }

  homerRightFieldcp1X: number = 1375 * this.screenPctAdj;
  homerRightFieldcp1Y: number = 0;
  homerRightFieldcp2X: number = 1400 * this.screenPctAdj;
  homerRightFieldcp2Y: number = -150;
  HomerRightField() {
    this.FlyBallHit(
      this.homerRightFieldcp1X,
      this.homerRightFieldcp1Y,
      this.homerRightFieldcp2X,
      this.homerRightFieldcp2Y,
      this.rightFielderX + 100,
      this.rightFielderY - 85
    );
  }

  homerRightFieldLinecp1X: number = 1550 * this.screenPctAdj;
  homerRightFieldLinecp1Y: number = 0;
  homerRightFieldLinecp2X: number = 1575 * this.screenPctAdj;
  homerRightFieldLinecp2Y: number = -100;
  HomerRightFieldLine() {
    this.FlyBallHit(
      this.homerRightFieldLinecp1X,
      this.homerRightFieldLinecp1Y,
      this.homerRightFieldLinecp2X,
      this.homerRightFieldLinecp2Y,
      this.rightFielderX + 240,
      this.rightFielderY - 65
    );
  }

  showSuccess(msg: string) {
    let position = this.Game.CurrentInning.IsBottomOfInning
      ? "toast-top-right"
      : "toast-top-left";

    this.toastr.success("", msg, {
      timeOut: 3000,
      positionClass: position,
      messageClass: "toast-message",
    });

    this.Game.PlayByPlays.push(msg);
  }

  showInfo(msg: string) {
    let position = this.Game.CurrentInning.IsBottomOfInning
      ? "toast-top-right"
      : "toast-top-left";

    this.toastr.warning("", msg, {
      timeOut: 3000,
      positionClass: position,
      messageClass: "toast-message",
    });

    this.Game.PlayByPlays.push(msg);
  }

  showWarning(msg: string) {
    let position = this.Game.CurrentInning.IsBottomOfInning
      ? "toast-top-right"
      : "toast-top-left";

    this.toastr.warning("", msg, {
      timeOut: 3000,
      positionClass: position,
      messageClass: "toast-message",
    });

    this.Game.PlayByPlays.push(msg);
  }

  showError(msg: string) {
    let position = this.Game.CurrentInning.IsBottomOfInning
      ? "toast-top-right"
      : "toast-top-left";

    this.toastr.error("", msg, {
      timeOut: 3000,
      positionClass: position,
      messageClass: "toast-message",
    });

    this.Game.PlayByPlays.push(msg);
  }

  FlipHomeAway() {
    this.Game.CurrentInning.IsBottomOfInning =
      !this.Game.CurrentInning.IsBottomOfInning;
  }

  setLineupPosition(
    pos: string,
    isHome: boolean,
    player: GamePlayerViewModel,
    index: number
  ) {
    if (isHome) {
      if (pos == "P") {
        this.Game.HomeTeam.HasReliefPitcherBeenUsed = true;
        this.Game.HomeTeam.BenchPitchers.splice(index, 1);
        player.BattingOrderNumber =
          this.Game.HomeTeam.Pitcher.BattingOrderNumber;
        this.Game.HomeTeam.Pitcher.BattingOrderNumber = 0;
        this.Game.HomeTeam.Pitcher.IsEligible = false;
        this.Game.HomeTeam.BenchPitchers.push(this.Game.HomeTeam.Pitcher);
        this.Game.HomeTeam.SetPitcher(
          player,
          this.Game.IsDesignatedHitterEnabled
        );

        if (!this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentAtBat.Pitcher = player;
        }
      } else {
        this.Game.HomeTeam.BenchPositionPlayers.splice(index, 1);

        if (pos == "C") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.Catcher.BattingOrderNumber;
          this.Game.HomeTeam.Catcher.BattingOrderNumber = 0;
          this.Game.HomeTeam.Catcher.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.Catcher
          );
          this.Game.HomeTeam.SetCatcher(player);
        } else if (pos == "1B") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.FirstBaseman.BattingOrderNumber;
          this.Game.HomeTeam.FirstBaseman.BattingOrderNumber = 0;
          this.Game.HomeTeam.FirstBaseman.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.FirstBaseman
          );
          this.Game.HomeTeam.SetFirstBase(player);
        } else if (pos == "2B") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.SecondBaseman.BattingOrderNumber;
          this.Game.HomeTeam.SecondBaseman.BattingOrderNumber = 0;
          this.Game.HomeTeam.SecondBaseman.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.SecondBaseman
          );
          this.Game.HomeTeam.SetSecondBase(player);
        } else if (pos == "SS") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.Shortstop.BattingOrderNumber;
          this.Game.HomeTeam.Shortstop.BattingOrderNumber = 0;
          this.Game.HomeTeam.Shortstop.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.Shortstop
          );
          this.Game.HomeTeam.SetShortstop(player);
        } else if (pos == "3B") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.ThirdBaseman.BattingOrderNumber;
          this.Game.HomeTeam.ThirdBaseman.BattingOrderNumber = 0;
          this.Game.HomeTeam.ThirdBaseman.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.ThirdBaseman
          );
          this.Game.HomeTeam.SetThirdBase(player);
        } else if (pos == "LF") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.LeftFielder.BattingOrderNumber;
          this.Game.HomeTeam.LeftFielder.BattingOrderNumber = 0;
          this.Game.HomeTeam.LeftFielder.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.LeftFielder
          );
          this.Game.HomeTeam.SetLeftField(player);
        } else if (pos == "CF") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.CenterFielder.BattingOrderNumber;
          this.Game.HomeTeam.CenterFielder.BattingOrderNumber = 0;
          this.Game.HomeTeam.CenterFielder.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.CenterFielder
          );
          this.Game.HomeTeam.SetCenterField(player);
        } else if (pos == "RF") {
          player.BattingOrderNumber =
            this.Game.HomeTeam.RightFielder.BattingOrderNumber;
          this.Game.HomeTeam.RightFielder.BattingOrderNumber = 0;
          this.Game.HomeTeam.RightFielder.IsEligible = false;
          this.Game.HomeTeam.BenchPositionPlayers.push(
            this.Game.HomeTeam.RightFielder
          );
          this.Game.HomeTeam.SetRightField(player);
        }
      }

      if (
        this.Game.CurrentAtBat.Batter.Position == pos &&
        this.Game.CurrentInning.IsBottomOfInning
      ) {
        this.Game.CurrentAtBat.Batter = player;
      }
    } else {
      if (pos == "P") {
        this.Game.AwayTeam.HasReliefPitcherBeenUsed = true;
        this.Game.AwayTeam.BenchPitchers.splice(index, 1);
        player.BattingOrderNumber =
          this.Game.AwayTeam.Pitcher.BattingOrderNumber;
        this.Game.AwayTeam.Pitcher.BattingOrderNumber = 0;
        this.Game.AwayTeam.Pitcher.IsEligible = false;
        this.Game.AwayTeam.BenchPitchers.push(this.Game.AwayTeam.Pitcher);
        this.Game.AwayTeam.SetPitcher(
          player,
          this.Game.IsDesignatedHitterEnabled
        );

        if (this.Game.CurrentInning.IsBottomOfInning) {
          this.Game.CurrentAtBat.Pitcher = player;
        }
      } else {
        this.Game.AwayTeam.BenchPositionPlayers.splice(index, 1);

        if (pos == "C") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.Catcher.BattingOrderNumber;
          this.Game.AwayTeam.Catcher.BattingOrderNumber = 0;
          this.Game.AwayTeam.Catcher.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.Catcher
          );
          this.Game.AwayTeam.SetCatcher(player);
        } else if (pos == "1B") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.FirstBaseman.BattingOrderNumber;
          this.Game.AwayTeam.FirstBaseman.BattingOrderNumber = 0;
          this.Game.AwayTeam.FirstBaseman.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.FirstBaseman
          );
          this.Game.AwayTeam.SetFirstBase(player);
        } else if (pos == "2B") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.SecondBaseman.BattingOrderNumber;
          this.Game.AwayTeam.SecondBaseman.BattingOrderNumber = 0;
          this.Game.AwayTeam.SecondBaseman.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.SecondBaseman
          );
          this.Game.AwayTeam.SetSecondBase(player);
        } else if (pos == "SS") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.Shortstop.BattingOrderNumber;
          this.Game.AwayTeam.Shortstop.BattingOrderNumber = 0;
          this.Game.AwayTeam.Shortstop.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.Shortstop
          );
          this.Game.AwayTeam.SetShortstop(player);
        } else if (pos == "3B") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.ThirdBaseman.BattingOrderNumber;
          this.Game.AwayTeam.ThirdBaseman.BattingOrderNumber = 0;
          this.Game.AwayTeam.ThirdBaseman.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.ThirdBaseman
          );
          this.Game.AwayTeam.SetThirdBase(player);
        } else if (pos == "LF") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.LeftFielder.BattingOrderNumber;
          this.Game.AwayTeam.LeftFielder.BattingOrderNumber = 0;
          this.Game.AwayTeam.LeftFielder.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.LeftFielder
          );
          this.Game.AwayTeam.SetLeftField(player);
        } else if (pos == "CF") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.CenterFielder.BattingOrderNumber;
          this.Game.AwayTeam.CenterFielder.BattingOrderNumber = 0;
          this.Game.AwayTeam.CenterFielder.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.CenterFielder
          );
          this.Game.AwayTeam.SetCenterField(player);
        } else if (pos == "RF") {
          player.BattingOrderNumber =
            this.Game.AwayTeam.RightFielder.BattingOrderNumber;
          this.Game.AwayTeam.RightFielder.BattingOrderNumber = 0;
          this.Game.AwayTeam.RightFielder.IsEligible = false;
          this.Game.AwayTeam.BenchPositionPlayers.push(
            this.Game.AwayTeam.RightFielder
          );
          this.Game.AwayTeam.SetRightField(player);
        }
      }

      if (
        this.Game.CurrentAtBat.Batter.Position == pos &&
        !this.Game.CurrentInning.IsBottomOfInning
      ) {
        this.Game.CurrentAtBat.Batter = player;
      }
    }

    this.timers.push(
      setTimeout(() => {
        this.ClearCanvas();
      }, 200)
    );

    this.showInfo(player.Name + " comes into the game.");

    this.scrollToTop();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
