import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import * as fromStanding from './+state/standing.reducer';
import { StandingEffects } from './+state/standing.effects';
import { StandingFacade } from './+state/standing.facade';
import { StandingListComponent } from './component/standing-list/standing-list.component';
import { StandingDriverComponent } from './component/standing-driver/standing-driver.component';
import { StandingRoutingModule } from './standing-routing.module';
import { StandingService } from './service/standing.service';
import { SeasonModule } from '../season/season.module';
import { MaterialModule } from '../material.module';
import { StandingActions } from './+state/standing.actions';
import { SharedModule } from '../shared/shared.module';
import { FlexModule } from '@angular/flex-layout';
import { StandingListItemComponent } from './component/standing-list/standing-list-item/standing-list-item.component';
import { DriverModule } from '../driver';
import { NumberCardComponent } from './component/standing-driver/number-card/number-card.component';
import { DriverResultComponent } from './component/standing-driver/driver-result/driver-result.component';
import { DriverQualifyingComponent } from './component/standing-driver/driver-qualifying/driver-qualifying.component';
import { QualifyingTimesComponent } from './component/standing-driver/driver-qualifying/qualifying-times/qualifying-times.component';

@NgModule({
  declarations: [
    StandingListComponent,
    StandingDriverComponent,
    StandingListItemComponent,
    NumberCardComponent,
    DriverResultComponent,
    DriverQualifyingComponent,
    QualifyingTimesComponent,
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature(
      fromStanding.STANDING_FEATURE_KEY,
      fromStanding.reducer
    ),
    EffectsModule.forFeature([StandingEffects]),
    MaterialModule,
    StandingRoutingModule,
    SeasonModule,
    SharedModule,
    FlexModule,
    DriverModule
  ],
  providers: [StandingFacade, StandingService],
})
export class StandingModule {

  constructor(facade: StandingFacade) {
    facade.dispatch(StandingActions.loadStandings());
  }
}