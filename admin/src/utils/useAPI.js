import { useFetchClient } from "@strapi/helper-plugin";
import React from "react";

const API_PATH = {
  backup: "/tm-backup/backups",
  backupID: "/tm-backup/backup",
};

export const useAPI = () => {
  const request = useFetchClient();

  const getBackups = async () => {
    try {
      const resp = await request.get(API_PATH.backup);
      return resp;
    } catch (error) {
      console.log("Get error", error);
      throw error;
    }
  };

  const getBackupID = async ({ id }) => {
    try {
      const resp = await request.get(`${API_PATH.backupID}/${id}`, {
        responseType: "blob",
      });
      return resp;
    } catch (error) {
      throw error;
    }
  };

  const delBackupID = async ({ id }) => {
    try {
      const resp = await request.del(`${API_PATH.backupID}/${id}`);
      return resp;
    } catch (error) {
      throw error;
    }
  };

  const createBackup = async (data) => {
    try {
      const resp = await request.post(`${API_PATH.backupID}`, data);
      console.log("resp", resp);
      return resp;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  };
  return {
    getBackups,
    getBackupID,
    delBackupID,
    createBackup,
  };
};
