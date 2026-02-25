type Input = {
}

type Output = {
  pushes: {
    stateClassIds: string[];
    flowIds: string[];
  };
};

function genesis(input: Input): Output {
  // state class IDs to be instantiated writes here
  const stateClassIds: string[] = [];

  // flow IDs to be enabled writes here
  const flowIds: string[] = [];

  return { pushes: { stateClassIds, flowIds } };
}

export default genesis;
