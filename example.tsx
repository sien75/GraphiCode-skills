import { State, Subscription, connect, getArg } from '@/graphicode-utils';
import React from 'react';
import { Observable } from 'rxjs';
import ChangePasswordDrawer from './ChangePasswordDrawer';
import PersonalCenterScene from './PersonalCenterScene';
import {
  ChangePasswordDrawerStatus,
  InstitutionInfo,
  PersonalCenterPageStatus,
  UserInfo,
} from './types';

// State Class - Manages internal state and logic of personal center page
export class PersonalCenterPageState extends Subscription implements State {
  // ========== private state ==========
  private status: PersonalCenterPageStatus = 'loaded';
  private changePasswordDrawerStatus: ChangePasswordDrawerStatus =
    'verifyPassword';
  private userInfo: UserInfo = {
    email: '',
    alias: '',
    roles: '',
    permissions: '',
  };
  private institutionInfo: InstitutionInfo = {
    institutionName: '',
    memberCode: '',
    institutionRole: '',
  };

  // ========== public methods ==========
  public setPageStatus(...args: { key: string; value: any }[]) {
    const status = getArg<PersonalCenterPageStatus>(args, 'status');
    if (status) {
      this.status = status;
      this._publish('PersonalCenterPageState.__stateChange', { status });
    }
  }

  public setChangePasswordDrawerStatus(...args: { key: string; value: any }[]) {
    const status = getArg<ChangePasswordDrawerStatus>(args, 'status');
    if (status) {
      this.changePasswordDrawerStatus = status;
      this._publish('PersonalCenterPageState.__stateChange', {
        changePasswordDrawerStatus: status,
      });
    }
  }

  public setUserInfo(...args: { key: string; value: any }[]) {
    const info = getArg<UserInfo>(args, 'info');
    if (info) {
      this.userInfo = info;
      this._publish('PersonalCenterPageState.__stateChange', {
        userInfo: info,
      });
    }
  }

  public setInstitutionInfo(...args: { key: string; value: any }[]) {
    const info = getArg<InstitutionInfo>(args, 'info');
    if (info) {
      this.institutionInfo = info;
      this._publish('PersonalCenterPageState.__stateChange', {
        institutionInfo: info,
      });
    }
  }

  public getState() {
    this._publish('PersonalCenterPageState.__stateChange', {
      status: this.status,
      changePasswordDrawerStatus: this.changePasswordDrawerStatus,
      userInfo: this.userInfo,
      institutionInfo: this.institutionInfo,
    });
  }

  // ========== subscription helper ==========
  public on(eventId: string): Observable<any> {
    return this._subscribe(eventId);
  }
}

const personalCenterPageState = new PersonalCenterPageState();

personalCenterPageState.enable();

const PersonalCenterPage: React.FC<{
  data: any;
  stateInstance: PersonalCenterPageState;
}> = (props) => {
  const { data, stateInstance } = props;

  return (
    <div>
      <PersonalCenterScene data={data} stateInstance={stateInstance} />
      <ChangePasswordDrawer data={data} stateInstance={stateInstance} />
    </div>
  );
};

const PersonalCenterPageWithState = connect(
  personalCenterPageState,
  'PersonalCenterPageState.__stateChange',
  PersonalCenterPage,
);

export default PersonalCenterPageWithState;
