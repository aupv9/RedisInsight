import { Selector, t } from 'testcafe';

export class DatabaseOverviewPage {
    //-------------------------------------------------------------------------------------------
    //DECLARATION OF SELECTORS
    //*Declare all elements/components of the relevant page.
    //*Target any element/component via data-id, if possible!
    //*The following categories are ordered alphabetically (Alerts, Buttons, Checkboxes, etc.).
    //-------------------------------------------------------------------------------------------
    // TEXT ELEMENTS
    overviewTotalKeys = Selector('[data-test-subj=overview-total-keys]');
    overviewTotalMemory = Selector('[data-test-subj=overview-total-memory]');
    databaseModules = Selector('[data-testid$=module]');
    overviewTooltipStatTitle = Selector('[data-testid=overview-db-stat-title]');
    // BUTTONS
    overviewRedisStackLogo = Selector('[data-testid=redis-stack-logo]');
    overviewMoreInfo = Selector('[data-testid=overview-more-info-button]');
    changeIndexBtn = Selector('[data-testid=change-index-btn]');
    applyButton = Selector('[data-testid=apply-btn]');
    // PANEL
    overviewTooltip = Selector('[data-testid=overview-more-info-tooltip]');
    // INPUTS
    changeIndexInput = Selector('[data-testid=change-index-input]');

    /**
     * Change database index
     * @param dbIndex The index of logical database
     */
    async changeDbIndex(dbIndex: number): Promise<void> {
        await t.click(this.changeIndexBtn)
            .typeText(this.changeIndexInput, dbIndex.toString(), { replace: true, paste: true })
            .click(this.applyButton)
            .expect(this.changeIndexBtn.textContent).contains(dbIndex.toString());
    }

    /**
     * Verify that definite database index selected
     * @param dbIndex The index of logical database
     */
    async verifyDbIndexSelected(dbIndex: number): Promise<void> {
        await t.expect(this.changeIndexBtn.textContent).contains(dbIndex.toString());
    }
}
