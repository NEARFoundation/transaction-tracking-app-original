export function AccountUpdatedLabel({ selectedAccountId, lastUpdate }): JSX.Element {
  if (selectedAccountId) {
    return (
      <>
        {lastUpdate ? (
          <div>
            {selectedAccountId}. Last update: {lastUpdate}
          </div>
        ) : (
          <div>{selectedAccountId}. Check back later</div>
        )}
      </>
    );
  } else {
    return <></>;
  }
}
