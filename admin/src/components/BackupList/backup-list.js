// @ts-nocheck
import {
  Switch,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Typography,
  Button,
  Box,
} from "@strapi/design-system";
import styles from "./styles.module.css";
import { useTrans } from "../../utils/useTrans";
const parseDate = (dateStr) => {
  const v = new Date(dateStr);

  const y = v.getFullYear();
  const mm = v.getMonth() + 1;
  const d = v.getDate();

  const h = v.getHours();
  const m = v.getMinutes();
  return `${y}-${mm}-${d} T ${h}:${m}`;
};
const BackupList = ({ data, handleDownload, handleDelete }) => {
  const [trans] = useTrans();
  const COLUMNS = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: trans("backup.table.identifier"),
      dataIndex: "identifier",
    },
    {
      title: trans("backup.table.manual"),
      dataIndex: "manual",
      type: "boolean",
    },
    {
      title: trans("backup.table.hasDB"),
      dataIndex: "hasDB",
      type: "boolean",
    },
    {
      title: trans("backup.table.hasUploads"),
      dataIndex: "hasUploads",
      type: "boolean",
    },
    {
      title: trans("backup.table.size"),
      dataIndex: "size",
      render: (record) => (
        <Typography size="s">{record.size?.toFixed(2) + " MB"}</Typography>
      ),
    },
    {
      title: trans("backup.table.dbEngine"),
      dataIndex: "dbEngine",
    },
    {
      title: trans("backup.table.createdAt"),
      dataIndex: "createdAt",
      render: (record) => (
        <Typography size="s">{parseDate(record?.createdAt)}</Typography>
      ),
    },
    {
      title: "Action",
      dataIndex: "",
      render: (record) => {
        return (
          <div className={styles.action}>
            <Button
              onClick={() => handleDelete(record)}
              size="S"
              variant="danger-light"
            >
              {trans("backup.Button.delete")}
            </Button>
            <Button
              onClick={() => handleDownload(record)}
              size="S"
              variant="ghost"
            >
              {trans("backup.Button.download")}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <Box className={styles.tableWrapper}>
      <Table className={styles.table} colCount={5}>
        <Thead>
          <Tr>
            {COLUMNS?.map((item) => (
              <Th key={item.title}>{item.title}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data?.map((row, rowIndex) => {
            return (
              <Tr key={`row_${rowIndex}`}>
                {COLUMNS?.map((item, cellIndex) => (
                  <Td key={`cell_${item.title}_${cellIndex}`}>
                    {item.render ? (
                      item.render(row)
                    ) : item.type === "boolean" ? (
                      <Switch
                        selected={row[item.dataIndex]}
                        className={styles.switch}
                        size="S"
                      />
                    ) : (
                      <Typography textColor="neutral800" size="S">
                        {row[item.dataIndex]}
                      </Typography>
                    )}
                  </Td>
                ))}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default BackupList;
