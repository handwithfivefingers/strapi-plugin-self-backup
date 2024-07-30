// @ts-nocheck

import { Box, Button, HeaderLayout } from "@strapi/design-system";
import { Check } from "@strapi/icons";
import { useTrans } from "../../utils/useTrans";

const Header = ({ onSave, onCancel, disabled, loading }) => {
  const [trans] = useTrans();
  return (
    <Box background="neutral100">
      <HeaderLayout
        primaryAction={
          <Box style={{ display: "flex" }}>
            <Button
              onClick={onCancel}
              type="cancel"
              size="L"
              variant="secondary"
              disabled={disabled}
              loading={loading}
            >
              {trans("backup.Button.cancel")}
            </Button>
            <Button
              style={{ marginLeft: "10px" }}
              onClick={onSave}
              type="submit"
              startIcon={<Check />}
              size="L"
              disabled={disabled}
              loading={loading}
            >
              {trans("backup.Button.save")}
            </Button>
          </Box>
        }
        title={trans("backup.name")}
        subtitle={trans("backup.description")}
        as="h2"
      />
    </Box>
  );
};

export default Header;
