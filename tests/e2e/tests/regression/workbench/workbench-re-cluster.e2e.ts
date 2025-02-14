import { t } from 'testcafe';
import { env, rte } from '../../../helpers/constants';
import {
    acceptLicenseTermsAndAddOSSClusterDatabase,
    acceptLicenseTermsAndAddRECloudDatabase,
    acceptLicenseTermsAndAddREClusterDatabase,
    acceptLicenseTermsAndAddSentinelDatabaseApi,
    deleteDatabase
} from '../../../helpers/database';
import { MyRedisDatabasePage, WorkbenchPage } from '../../../pageObjects';
import { cloudDatabaseConfig, commonUrl, ossClusterConfig, ossSentinelConfig, redisEnterpriseClusterConfig } from '../../../helpers/conf';
import { deleteOSSClusterDatabaseApi, deleteAllDatabasesByConnectionTypeApi } from '../../../helpers/api/api-database';
import { Common } from '../../../helpers/common';

const myRedisDatabasePage = new MyRedisDatabasePage();
const workbenchPage = new WorkbenchPage();
const common = new Common();

const commandForSend1 = 'info';
const commandForSend2 = 'FT._LIST';
const verifyCommandsInWorkbench = async(): Promise<void> => {
    const multipleCommands = [
        'info',
        'command',
        'FT.SEARCH idx *'
    ];

    await t.click(myRedisDatabasePage.workbenchButton);
    // Send commands
    await workbenchPage.sendCommandInWorkbench(commandForSend1);
    await workbenchPage.sendCommandInWorkbench(commandForSend2);
    // Check that all the previous run commands are saved and displayed
    await common.reloadPage();
    await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend1).exists).ok('The previous run commands are saved');
    await t.expect(workbenchPage.queryCardCommand.withExactText(commandForSend2).exists).ok('The previous run commands are saved');
    // Send multiple commands in one query
    await workbenchPage.sendCommandInWorkbench(multipleCommands.join('\n'), 0.75);
    // Check that the results for all commands are displayed
    for (const command of multipleCommands) {
        await t.expect(workbenchPage.queryCardCommand.withExactText(command).exists).ok(`The command ${command} from multiple query is displayed`);
    }
};

fixture `Work with Workbench in all types of databases`
    .meta({ type: 'regression' })
    .page(commonUrl);
test
    .meta({ rte: rte.reCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddREClusterDatabase(redisEnterpriseClusterConfig);
    })
    .after(async() => {
        // Delete database
        await deleteDatabase(redisEnterpriseClusterConfig.databaseName);
    })('Verify that user can run commands in Workbench in RE Cluster DB', async() => {
        await verifyCommandsInWorkbench();
    });
test
    .meta({ rte: rte.reCloud })
    .before(async() => {
        await acceptLicenseTermsAndAddRECloudDatabase(cloudDatabaseConfig);
    })
    .after(async() => {
        // Delete database
        await deleteDatabase(cloudDatabaseConfig.databaseName);
    })('Verify that user can run commands in Workbench in RE Cloud DB', async() => {
        await verifyCommandsInWorkbench();
    });
test
    .meta({ rte: rte.ossCluster })
    .before(async() => {
        await acceptLicenseTermsAndAddOSSClusterDatabase(ossClusterConfig, ossClusterConfig.ossClusterDatabaseName);
    })
    .after(async() => {
        // Delete database
        await deleteOSSClusterDatabaseApi(ossClusterConfig);
    })('Verify that user can run commands in Workbench in OSS Cluster DB', async() => {
        await verifyCommandsInWorkbench();
    });
test
    .meta({ env: env.web, rte: rte.sentinel })
    .before(async() => {
        await acceptLicenseTermsAndAddSentinelDatabaseApi(ossSentinelConfig);
    })
    .after(async() => {
        // Delete database
        await deleteAllDatabasesByConnectionTypeApi('SENTINEL');
    })('Verify that user can run commands in Workbench in Sentinel Primary Group', async() => {
        await verifyCommandsInWorkbench();
    });
