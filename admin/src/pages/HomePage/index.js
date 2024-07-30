// @ts-nocheck
/*
 *
 * HomePage
 *
 */

import {
  Button,
  Grid,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalLayout,
  Typography,
  GridItem,
  ToggleInput,
  useTheme,
  Loader,
} from "@strapi/design-system";
import { useFetchClient } from "@strapi/helper-plugin";
import React, { memo, useEffect, useState } from "react";
import BackupList from "../../components/BackupList/backup-list";
import pluginId from "../../pluginId";
import { useTrans } from "../../utils/useTrans";

const INIT_FORM = {
  hasDB: false,
  hasUploads: false,
};
const HomePage = () => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [trans] = useTrans();
  const request = useFetchClient();
  const [data, setData] = useState([]);
  const [form, setForm] = useState(INIT_FORM);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    getScreenData();
  }, []);

  const getScreenData = async () => {
    try {
      setLoading(true);
      const resp = await request.get("/tm-backup/backups");
      setData(resp.data);
    } catch (error) {
      console.log("Get error", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDownload = async (record) => {
    try {
      const download = (blob, filename) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      };
      const resp = await request.get(`${pluginId}/backup/${record.id}`, {
        responseType: "blob",
      });

      download(resp.data, `backup_${record.identifier}.zip`);
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleDelete = async (record) => {
    try {
      const resp = await request.del(`${pluginId}/backup/${record.id}`);
      console.log("resp", resp);
      getScreenData();
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCheck = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const submitForm = async () => {
    try {
      setLoading(true);
      console.log("submit");
      const resp = await request.post(`/${pluginId}/backup`, form);
      console.log("resp", resp);
      onCancel();
      getScreenData();
    } catch (error) {
      console.log("error", error);
    } finally {
      setLoading(false);
    }
  };
  const onCancel = () => {
    setOpen(false);
    setForm(INIT_FORM);
  };
  console.log("theme", theme);
  return (
    <div style={{ padding: "18px 30px 66px 30px" }}>
      <Typography tag="h1" variant="alpha" textColor="neutral800">
        {trans("backup.name")}
      </Typography>
      <div
        style={{
          padding: "18px 0 66px 0",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {(loading && <LoadingScreen />) || ""}

        <div>
          <Button onClick={() => setOpen(true)}>
            {trans("backup.Button.create")}
          </Button>
        </div>

        <BackupList
          data={data}
          handleDownload={handleDownload}
          handleDelete={handleDelete}
        />

        {(open && (
          <ModalLayout onClose={() => setOpen(false)}>
            <ModalHeader>
              <Typography tag="h5" variant="alpha" textColor="neutral800">
                {trans("backup.Modal.create.title")}
              </Typography>
            </ModalHeader>
            <ModalBody>
              <Grid gap={4}>
                <GridItem col={6} s={6}>
                  <ToggleInput
                    hint={trans("backup.hasDB.description")}
                    label={trans("backup.hasDB.label")}
                    name="hasDB"
                    onLabel="on"
                    offLabel="off"
                    onChange={handleCheck}
                  />
                </GridItem>
                <GridItem col={6} s={6}>
                  <ToggleInput
                    hint={trans("backup.hasUploads.description")}
                    label={trans("backup.hasUploads.label")}
                    name="hasUploads"
                    onLabel="on"
                    offLabel="off"
                    onChange={handleCheck}
                  />
                </GridItem>
              </Grid>
            </ModalBody>
            <ModalFooter
              startActions={
                <Button
                  onClick={() => onCancel()}
                  variant="tertiary"
                  loading={loading}
                >
                  {trans("backup.Button.cancel")}
                </Button>
              }
              endActions={
                <Button onClick={submitForm} loading={loading}>
                  {trans("backup.Button.create")}
                </Button>
              }
            />
          </ModalLayout>
        )) ||
          ""}
      </div>
    </div>
  );
};

export default memo(HomePage);

const LoadingScreen = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "auto",
          marginBottom: "auto",
          height: "100%",
        }}
      >
        <Loader>Loading content...</Loader>
      </div>
    </div>
  );
};
