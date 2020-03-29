import { Box, Card, Field, Input, Button } from "rimble-ui";

import Select from "../../components/Select";

const SwapOptions = () => {
  // console.log()
  return (
    <Card>
      <Box>
        <Field label="I would like to swap" width="100%">
          <Select required>
            <option value="debt">Debt</option>
            <option value="collateral">Collateral</option>
          </Select>
        </Field>
      </Box>

      <Box>
        <Field label="From Token A" width="100%">
          <Select required>
            <optgroup label="Volatile Crypto">
              <option value="eth">Ethereum</option>
              <option value="bat">Basic Attention Token</option>
            </optgroup>
            <optgroup label="Stablecoin">
              <option value="dai">DAI</option>
              <option value="usdc">USD Coin</option>
            </optgroup>
          </Select>
        </Field>
      </Box>

      <Box>
        <Field label="To Token B" width="100%">
          <Select required>
            <optgroup label="Volatile Crypto">
              <option value="eth">Ethereum</option>
              <option value="bat">Basic Attention Token</option>
            </optgroup>
            <optgroup label="Stablecoin">
              <option value="dai">DAI</option>
              <option value="usdc">USD Coin</option>
            </optgroup>
          </Select>
        </Field>
      </Box>

      <Box>
        <Field label="Amount of Token A to swap">
          <Input type="text" required={true} placeholder="1.0" />
        </Field>
      </Box>

      <Button width="100%">Swap</Button>
    </Card>
  );
};
export default SwapOptions;
