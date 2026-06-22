import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-webpart-base';
import * as React from 'react';
import * as ReactDom from 'react-dom';
import OrgChartContainer from './components/OrgChartContainer';
import { initSp } from './services/spService';

export interface IOrgChartWebPartProps {
  usListName: string;   
  vnListName: string;
}

export default class OrgChartWebPart extends BaseClientSideWebPart<IOrgChartWebPartProps> {
  public async onInit(): Promise<void> {
    await super.onInit();
    // initialize PnPjs (v3) SPFx middleware
    initSp(this.context);
  }

  public render(): void {
   this.domElement.innerHTML = `<div id="orgChartRoot"></div>`;
    const element = React.createElement(OrgChartContainer, {
      usListName: this.properties.usListName || 'OrgChart_US',
      vnListName: this.properties.vnListName || 'OrgChart_VN',
    });
    ReactDom.render(element, this.domElement.querySelector('#orgChartRoot'));
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Org Chart settings' },
          groups: [
            {
              groupName: 'Source',
              groupFields: [
              PropertyPaneTextField('usListName', {
                label: 'US Org Chart List Name',
                value: 'OrgChart_US'
              }),
              PropertyPaneTextField('vnListName', {
                label: 'VN Org Chart List Name',
                value: 'OrgChart_VN'
              }),
              ]
            }
          ]
        }
      ]
    };
  }
}