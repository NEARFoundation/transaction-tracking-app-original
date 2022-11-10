export function AccountUpdatedLabel({ selectedAccountId, lastUpdate, isLoading }): JSX.Element {
  if (selectedAccountId) {
    return (
      <>
        {lastUpdate ? (
          <div>
            {selectedAccountId}. Last update: {lastUpdate}
          </div>
        ) : (
          <div>
            {selectedAccountId}. {isLoading ? 'Loading...' : '(Still in progress downloading.)'}
          </div>
        )}
      </>
    );
  } else {
    return <></>;
  }
}
