
CREATE TABLE action_receipt_actions (
    receipt_id text,
    index_in_action_receipt integer,
    action_kind action_kind,
    args jsonb,
    receipt_predecessor_account_id text,
    receipt_receiver_account_id text,
    receipt_included_in_block_timestamp numeric(20,0)
);

CREATE TABLE blocks (
    block_height numeric(20,0),
    block_hash text,
    prev_block_hash text,
    block_timestamp numeric(20,0),
    total_supply numeric(45,0),
    gas_price numeric(45,0),
    author_account_id text
);

CREATE TABLE execution_outcomes (
    receipt_id text,
    executed_in_block_hash text,
    executed_in_block_timestamp numeric(20,0),
    index_in_chunk integer,
    gas_burnt numeric(20,0),
    tokens_burnt numeric(45,0),
    executor_account_id text,
    status execution_outcome_status,
    shard_id numeric(20,0)
);

CREATE TABLE receipts (
    receipt_id text,
    included_in_block_hash text,
    included_in_chunk_hash text,
    index_in_chunk integer,
    included_in_block_timestamp numeric(20,0),
    predecessor_account_id text,
    receiver_account_id text,
    receipt_kind receipt_kind,
    originated_from_transaction_hash text
);

CREATE TABLE transactions (
    transaction_hash text,
    included_in_block_hash text,
    included_in_chunk_hash text,
    index_in_chunk integer,
    block_timestamp numeric(20,0),
    signer_account_id text,
    signer_key text,
    nonce numeric(20,0),
    receiver_account_id text,
    signature text,
    status execution_outcome_status,
    converted_into_receipt_id text,
    receipt_conversion_gas_burnt numeric(20,0),
    receipt_conversion_tokens_burnt numeric(45,0)
);

INSERT INTO action_receipt_actions (receipt_id, index_in_action_receipt, action_kind, args, receipt_predecessor_account_id, receipt_receiver_account_id, receipt_included_in_block_timestamp) VALUES ('HpMfG5HTjVEmw2PBq7J8tBy9k4pemr1j2emtLaCEu8FW', 0, 'FUNCTION_CALL', '{"gas": 100000000000000, "deposit": "100000000000000000000000", "args_json": {"new_account_id": "newafro.near", "new_key": "2LtNBZGX3xCw9Jm4ngws8TMUy2JkWApHMhsg6PU9QtAN"}, "args_base64": "eyJuZXdfYWNjb3VudF9pZCI6Im5ld2Fmcm8ubmVhciIsIm5ld19wdWJsaWNfa2V5IjoiMkx0TkJaR1gzeEN3OUptNG5nd3M4VE1VeTJKa1dBcEhNaHNnNlBVOVF0QU4ifQ==", "method_name": "create_account"}', '54a698eae4063a944e673debe90a0287fdc278250179e3c1d580ec418f36e79b', 'near', 1646393106196645500);
INSERT INTO action_receipt_actions (receipt_id, index_in_action_receipt, action_kind, args, receipt_predecessor_account_id, receipt_receiver_account_id, receipt_included_in_block_timestamp) VALUES ('8ggVvSUo7PEB4rLTXRrQvLAZoHXUtusK8ssBZLkQ5oEH', 0, 'TRANSFER', '{"deposit": "50000000000000000000000000"}', 'newafro.near', 'linkdropping.near', 1646393741659301870);
INSERT INTO action_receipt_actions (receipt_id, index_in_action_receipt, action_kind, args, receipt_predecessor_account_id, receipt_receiver_account_id, receipt_included_in_block_timestamp) VALUES ('5g31WxtwPULwWiyogquXUnAHPNvuJn95eNDY8zvkNJ5d', 0, 'TRANSFER', '{"deposit": "99846102906704198000000000"}', '54a698eae4063a944e673debe90a0287fdc278250179e3c1d580ec418f36e79b', 'newafro.near', 1646393142823587582);
INSERT INTO action_receipt_actions (receipt_id, index_in_action_receipt, action_kind, args, receipt_predecessor_account_id, receipt_receiver_account_id, receipt_included_in_block_timestamp) VALUES ('4c5gU7aQEPQrBHnoZoQ9o8MdCtnXELzxVTXDWkUg54dT', 0, 'TRANSFER', '{"deposit": "1000000000000000000000000"}', 'nf-payments2.near', 'nearhub-dao.sputnik-dao.near', 1646760449854817941);

INSERT INTO blocks (block_height, block_hash, prev_block_hash, block_timestamp, total_supply, gas_price, author_account_id) VALUES (60729130, 'GKvWe6hJ9h1TWFgWWwYzBMmJG6p959hSdV1gDLcBN1EK', 'D9Ghy8K9y5Y2QWpuMMC4ZH3yTLR26Df4cu1K3kixWySH', 1646393106196645500, 1069406771555478033729611165790581, 100000000, 'magic.poolv1.near');
INSERT INTO blocks (block_height, block_hash, prev_block_hash, block_timestamp, total_supply, gas_price, author_account_id) VALUES (60729636, 'H9oW2T4Rib53XjiDf5yy3jiAJbQ9oPmCooQwugvCvYxL', 'HbbN1xDqKrauRvRFpSWFMHjXaoD49WLBfAQeb43mZZJZ', 1646393741659301870, 1069406768723797361984502465790581, 100000000, 'nc2.poolv1.near');
INSERT INTO blocks (block_height, block_hash, prev_block_hash, block_timestamp, total_supply, gas_price, author_account_id) VALUES (60729160, '8f6Xb4JYdFdWFLXVWquvmYXYjXVpecbYWcgncdU7icyt', 'E27crKvaGf2eM7sxSGFKat1eCsXbK98nXrPMknpRHPnP', 1646393142823587582, 1069406771426798225531263065790581, 100000000, 'dragonfly.poolv1.near');
INSERT INTO blocks (block_height, block_hash, prev_block_hash, block_timestamp, total_supply, gas_price, author_account_id) VALUES (61022055, '8ifDRL49Mn5vkAH2YPE5quWnUSGQrqsGr58jnyWGD56G', 'FHB2xDebA2fFoz3UUHWHnQ5b8xcTtgYDftoPnGuyzmwo', 1646760449854817941, 1070046602379040880155067399100971, 100000000, 'bzam6yjpnfnxsdmjf6pw.poolv1.near');

INSERT INTO execution_outcomes (receipt_id, executed_in_block_hash, executed_in_block_timestamp, index_in_chunk, gas_burnt, tokens_burnt, executor_account_id, status, shard_id) VALUES ('HpMfG5HTjVEmw2PBq7J8tBy9k4pemr1j2emtLaCEu8FW', 'GKvWe6hJ9h1TWFgWWwYzBMmJG6p959hSdV1gDLcBN1EK', 1646393106196645500, 2, 6144900315164, 614490031516400000000, 'near', 'SUCCESS_RECEIPT_ID', 3);
INSERT INTO execution_outcomes (receipt_id, executed_in_block_hash, executed_in_block_timestamp, index_in_chunk, gas_burnt, tokens_burnt, executor_account_id, status, shard_id) VALUES ('8ggVvSUo7PEB4rLTXRrQvLAZoHXUtusK8ssBZLkQ5oEH', 'H9oW2T4Rib53XjiDf5yy3jiAJbQ9oPmCooQwugvCvYxL', 1646393741659301870, 8, 223182562500, 22318256250000000000, 'linkdropping.near', 'SUCCESS_VALUE', 3);
INSERT INTO execution_outcomes (receipt_id, executed_in_block_hash, executed_in_block_timestamp, index_in_chunk, gas_burnt, tokens_burnt, executor_account_id, status, shard_id) VALUES ('5g31WxtwPULwWiyogquXUnAHPNvuJn95eNDY8zvkNJ5d', '8f6Xb4JYdFdWFLXVWquvmYXYjXVpecbYWcgncdU7icyt', 1646393142823587582, 0, 223182562500, 22318256250000000000, 'newafro.near', 'SUCCESS_VALUE', 3);
INSERT INTO execution_outcomes (receipt_id, executed_in_block_hash, executed_in_block_timestamp, index_in_chunk, gas_burnt, tokens_burnt, executor_account_id, status, shard_id) VALUES ('4c5gU7aQEPQrBHnoZoQ9o8MdCtnXELzxVTXDWkUg54dT', '8ifDRL49Mn5vkAH2YPE5quWnUSGQrqsGr58jnyWGD56G', 1646760449854817941, 1, 223182562500, 22318256250000000000, 'nearhub-dao.sputnik-dao.near', 'SUCCESS_VALUE', 3);

INSERT INTO receipts (receipt_id, included_in_block_hash, included_in_chunk_hash, index_in_chunk, included_in_block_timestamp, predecessor_account_id, receiver_account_id, receipt_kind, originated_from_transaction_hash) VALUES ('HpMfG5HTjVEmw2PBq7J8tBy9k4pemr1j2emtLaCEu8FW', 'GKvWe6hJ9h1TWFgWWwYzBMmJG6p959hSdV1gDLcBN1EK', 'AEYyTheWn8oD6R5mc5GxhNtizNJM17Mpq1dHpuqLbuJF', 1, 1646393106196645500, '54a698eae4063a944e673debe90a0287fdc278250179e3c1d580ec418f36e79b', 'near', 'ACTION', 'FzfAU2MWTj76L3jRWo6wYQSmj1WR6GdHZNZZ5fKfVUjm');
INSERT INTO receipts (receipt_id, included_in_block_hash, included_in_chunk_hash, index_in_chunk, included_in_block_timestamp, predecessor_account_id, receiver_account_id, receipt_kind, originated_from_transaction_hash) VALUES ('8ggVvSUo7PEB4rLTXRrQvLAZoHXUtusK8ssBZLkQ5oEH', 'H9oW2T4Rib53XjiDf5yy3jiAJbQ9oPmCooQwugvCvYxL', '9sq9xbNGQZQwhk79Jd3cpnAAvTJZvMmB6prRuFSkZ348', 0, 1646393741659301870, 'newafro.near', 'linkdropping.near', 'ACTION', 'Wc15ScL3hVMJB1EPymmgQ1JwaE14ejpTbPBP2guGDFf');
INSERT INTO receipts (receipt_id, included_in_block_hash, included_in_chunk_hash, index_in_chunk, included_in_block_timestamp, predecessor_account_id, receiver_account_id, receipt_kind, originated_from_transaction_hash) VALUES ('5g31WxtwPULwWiyogquXUnAHPNvuJn95eNDY8zvkNJ5d', '8f6Xb4JYdFdWFLXVWquvmYXYjXVpecbYWcgncdU7icyt', '9qTQzV5KTwR7CX2amwY5wat4B4WmJgcnxfikwajQ3mCw', 1, 1646393142823587582, '54a698eae4063a944e673debe90a0287fdc278250179e3c1d580ec418f36e79b', 'newafro.near', 'ACTION', 'ABMgV1tA88oVuJtc2n9r9xvBMiwQtmaFrwUNKowqFiqD');
INSERT INTO receipts (receipt_id, included_in_block_hash, included_in_chunk_hash, index_in_chunk, included_in_block_timestamp, predecessor_account_id, receiver_account_id, receipt_kind, originated_from_transaction_hash) VALUES ('4c5gU7aQEPQrBHnoZoQ9o8MdCtnXELzxVTXDWkUg54dT', '8ifDRL49Mn5vkAH2YPE5quWnUSGQrqsGr58jnyWGD56G', '64YVDJQ7WhxeuTudntERwZdJEb7hBNN3hNTbBb54Ytxg', 4, 1646760449854817941, 'nf-payments2.near', 'nearhub-dao.sputnik-dao.near', 'ACTION', 'Fw7GXvpm1Akse7CCzVJR1b5SMkGBbqR1C9iNuC1R19jk');

INSERT INTO transactions (transaction_hash, included_in_block_hash, included_in_chunk_hash, index_in_chunk, block_timestamp, signer_account_id, signer_key, nonce, receiver_account_id, signature, status, converted_into_receipt_id, receipt_conversion_gas_burnt, receipt_conversion_tokens_burnt) VALUES ('FzfAU2MWTj76L3jRWo6wYQSmj1WR6GdHZNZZ5fKfVUjm', 'D9Ghy8K9y5Y2QWpuMMC4ZH3yTLR26Df4cu1K3kixWySH', '9NoPpS2q5Xpwcj6pNNFqjroogWgE15VuiUVvH8mDHbaX', 1, 1646393104775468738, '54a698eae4063a944e673debe90a0287fdc278250179e3c1d580ec418f36e79b', 'ed25519:5hQyc3zf2UXhEMWbXVyztxdXF5BDXZ9aNJSFftHUHpk6', 60728946000001, 'near', 'ed25519:3FJuvyyphJxv38g4N3RJhH7rodqD4UBmpRnnz6hAwAYiUZWkj5gdR2xDCqNoLJmm4TgCHMAQ5pHENStnbnLLwdrS', 'SUCCESS_RECEIPT_ID', 'HpMfG5HTjVEmw2PBq7J8tBy9k4pemr1j2emtLaCEu8FW', 2428169188674, 242816918867400000000);
INSERT INTO transactions (transaction_hash, included_in_block_hash, included_in_chunk_hash, index_in_chunk, block_timestamp, signer_account_id, signer_key, nonce, receiver_account_id, signature, status, converted_into_receipt_id, receipt_conversion_gas_burnt, receipt_conversion_tokens_burnt) VALUES ('Wc15ScL3hVMJB1EPymmgQ1JwaE14ejpTbPBP2guGDFf', 'HbbN1xDqKrauRvRFpSWFMHjXaoD49WLBfAQeb43mZZJZ', 'Fzgmd4rnTY3rPiGfs75RHGAs3FAuB1uMdjXihd2sha2h', 0, 1646393740318318106, 'newafro.near', 'ed25519:EHPeimCFYsnn3LnFYsECPBtTdwi5nLnJZzkvgkWnCAx6', 60729135000001, 'linkdropping.near', 'ed25519:Y42VqaCJmX7uWcF4pHY5k3VsixFbmcgarxP8CZN17Cbqq21Hc75a7EqUASf5ukfK57j7WWjGnsiingBkEJZVsht', 'SUCCESS_RECEIPT_ID', '8ggVvSUo7PEB4rLTXRrQvLAZoHXUtusK8ssBZLkQ5oEH', 223182562500, 22318256250000000000);
INSERT INTO transactions (transaction_hash, included_in_block_hash, included_in_chunk_hash, index_in_chunk, block_timestamp, signer_account_id, signer_key, nonce, receiver_account_id, signature, status, converted_into_receipt_id, receipt_conversion_gas_burnt, receipt_conversion_tokens_burnt) VALUES ('ABMgV1tA88oVuJtc2n9r9xvBMiwQtmaFrwUNKowqFiqD', 'E27crKvaGf2eM7sxSGFKat1eCsXbK98nXrPMknpRHPnP', '5h31jS9idMZX3rSoHqZ8reqK69Ag6VvoSLXteJZP9jFu', 0, 1646393141485255977, '54a698eae4063a944e673debe90a0287fdc278250179e3c1d580ec418f36e79b', 'ed25519:5hQyc3zf2UXhEMWbXVyztxdXF5BDXZ9aNJSFftHUHpk6', 60728946000002, 'newafro.near', 'ed25519:5LDSenzJLxuRuYtHbMt5wqpxanjHS6W91frZyHeBnhvJDQGiA4eFUcXWpRfRtSxKE5JpxkjuT5gh1wKPvyka6qzm', 'SUCCESS_RECEIPT_ID', '5g31WxtwPULwWiyogquXUnAHPNvuJn95eNDY8zvkNJ5d', 223182562500, 22318256250000000000);
INSERT INTO transactions (transaction_hash, included_in_block_hash, included_in_chunk_hash, index_in_chunk, block_timestamp, signer_account_id, signer_key, nonce, receiver_account_id, signature, status, converted_into_receipt_id, receipt_conversion_gas_burnt, receipt_conversion_tokens_burnt) VALUES ('Fw7GXvpm1Akse7CCzVJR1b5SMkGBbqR1C9iNuC1R19jk', 'FHB2xDebA2fFoz3UUHWHnQ5b8xcTtgYDftoPnGuyzmwo', 'CKq1UpGLnez9xbMcXrND4VQqXQu48owKYcxmJJ5bUptK', 4, 1646760448420212856, 'nf-payments2.near', 'ed25519:2ZZrjLeWEvvaLwxCc2YPWR4k86Ri1shJEVDhmkYWEQ6E', 60100605000052, 'nearhub-dao.sputnik-dao.near', 'ed25519:41ViARHxbKipm9TwZsU1j75v4mUtWpsWeMX2DURuLegrR2V163qjLH57VtBs19shUqD7oM3Xpw6f523HLZmJAvK6', 'SUCCESS_RECEIPT_ID', '4c5gU7aQEPQrBHnoZoQ9o8MdCtnXELzxVTXDWkUg54dT', 223182562500, 22318256250000000000);
