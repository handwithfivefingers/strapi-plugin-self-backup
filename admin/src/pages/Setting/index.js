// @ts-nocheck
import { Grid, GridItem, SingleSelect, SingleSelectOption, ToggleInput } from "@strapi/design-system";
import { useFetchClient } from "@strapi/helper-plugin";
import { useEffect, useState } from "react";
import Header from "../../components/Header/header";
import pluginId from "../../pluginId";
import { useTrans } from "../../utils/useTrans";

const Setting = () => {
  const [trans] = useTrans();
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const request = useFetchClient();

  const [backupSetting, setBackupSetting] = useState({
    manual: false,
    hasDB: false,
    hasUploads: false,
    autoRemove: false,
    scheduleTime: "",
  });

  useEffect(() => {
    getScreenData();
  }, []);
  const getScreenData = async () => {
    try {
      setLoading(true);

      const resp = await request.get(`/${pluginId}/setting`);
      console.log("resp", resp);
      const { data } = resp.data;
      setBackupSetting(data);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeManual = (e) => {
    setBackupSetting((prev) => ({
      ...prev,
      [e.target.name]: e.target.checked,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await request.put(`/${pluginId}/setting`, backupSetting);
      setDisabled(true);
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={{ padding: "18px 30px 66px 30px" }}>
      <Header onSave={handleSave} disabled={disabled} loading={loading} />

      <Grid gap={4}>
        <GridItem col={6} s={6}>
          <ToggleInput
            hint={trans("backup.manual.description")}
            label={trans("backup.manual.label")}
            name="manual"
            onLabel="on"
            offLabel="off"
            checked={backupSetting.manual}
            onChange={handleChangeManual}
          />
        </GridItem>
        <GridItem col={6} s={12}>
          {backupSetting?.manual ? (
            <SingleSelect
              hint={trans("backup.scheduleTime.description")}
              label={trans("backup.scheduleTime.label")}
              name="scheduleTime"
              value={backupSetting.scheduleTime}
              onChange={(e) => {
                setBackupSetting((prev) => ({
                  ...prev,
                  scheduleTime: e,
                }));
              }}
            >
              {/* <SingleSelectOption value="* * * * *">1 minutes</SingleSelectOption> */}
              <SingleSelectOption value="0 0 * * 1-7">{trans("backup.scheduleTime.daily")}</SingleSelectOption>
              <SingleSelectOption value="0 0 * * 1/3">{trans("backup.scheduleTime.per3Day")}</SingleSelectOption>
              <SingleSelectOption value="0 0 * * 1">{trans("backup.scheduleTime.perWeek")}</SingleSelectOption>
              <SingleSelectOption value="0 0 1,15 * *">{trans("backup.scheduleTime.perTwoWeek")}</SingleSelectOption>
              <SingleSelectOption value="0 0 1,11,21 * *">
                {trans("backup.scheduleTime.perThreeWeek")}
              </SingleSelectOption>
              <SingleSelectOption value="0 0 1 * *">{trans("backup.scheduleTime.perMonth")}</SingleSelectOption>
            </SingleSelect>
          ) : (
            ""
          )}
        </GridItem>

        <GridItem col={6} s={6}>
          <ToggleInput
            hint={trans("backup.hasDB.description")}
            label={trans("backup.hasDB.label")}
            name="hasDB"
            onLabel="on"
            offLabel="off"
            checked={backupSetting.hasDB}
            onChange={handleChangeManual}
          />
        </GridItem>
        <GridItem col={6} s={6}>
          {backupSetting?.manual ? (
            <ToggleInput
              hint={trans("backup.autoRemove.description")}
              label={trans("backup.autoRemove.label")}
              name="autoRemove"
              onLabel="on"
              offLabel="off"
              checked={backupSetting.autoRemove}
              onChange={handleChangeManual}
            />
          ) : (
            ""
          )}
        </GridItem>
        <GridItem col={12} s={12}>
          <ToggleInput
            hint={trans("backup.hasUploads.description")}
            label={trans("backup.hasUploads.label")}
            name="hasUploads"
            onLabel="on"
            offLabel="off"
            checked={backupSetting.hasUploads}
            onChange={handleChangeManual}
          />
        </GridItem>
      </Grid>
    </div>
  );
};

export default Setting;
