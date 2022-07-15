import 'regenerator-runtime/runtime'
import React, {useState, useEffect} from 'react'
import './global.css'
import CsvDownload from 'react-json-to-csv'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MultiSelect from "react-select";

export default function App() {
    const [msg, setMsg] = useState('');
    const [msgCSV, setMsgCSV] = useState('');
    const [newAccountId, setNewAccountId] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedAccountCSV, setSelectedAccountCSV] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [types, setTypes] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [csvTransactions, setCsvTransactions] = useState([]);
    const [lastUpdate, setLastUpdate] = useState('');
    const [startDate, setStartDate] = useState(() => {
        const saved = localStorage.getItem("rangeDate");
        const initialValue = JSON.parse(saved);
        if (initialValue) {
            return new Date(initialValue.startDate);
        } else {
            const start = new Date(Date.UTC(2020, 9, 1, 0, 0, 0));
            return new Date(start);
        }
    });
    const [endDate, setEndDate] = useState(() => {
        const saved = localStorage.getItem("rangeDate");
        const initialValue = JSON.parse(saved);
        if (initialValue) {
            return new Date(initialValue.endDate);
        } else {
            const end = new Date();
            end.setUTCHours(23, 59, 59, 999);
            end.setDate(end.getDate() + 1);
            return new Date(end);
        }
    });

    const [accountIDs, setAccountIDs] = useState(() => {
        const saved = localStorage.getItem("accountIDs");
        const initialValue = JSON.parse(saved);
        return initialValue || [];
    });
    const [accountsStatus, setAccountsStatus] = useState([]);

    useEffect(() => {
        getTypes().then();
        getAccounts().then();
        setInterval(() => {
            getAccounts().then();
        }, 30000);

    }, []);

    useEffect(() => {
        localStorage.setItem("accountIDs", JSON.stringify(accountIDs));
        setCsvTransactions([]);
        getAccounts().then();
    }, [accountIDs]);

    useEffect(() => {
        getTransactionsCSV();
    }, [selectedAccountCSV]);


    useEffect(() => {
        setMsg('');
        if (selectedAccountId) getTransactions(selectedAccountId).then();
        localStorage.setItem("rangeDate", JSON.stringify({startDate, endDate}));
        setCsvTransactions([]);
    }, [startDate, endDate, selectedTypes]);

    const MultiSelectStyles = {
        valueContainer: (base) => ({
            ...base,
            maxHeight: 500,
            overflowY: "auto"
        }),
    };

    const addAccountCSV = (e) => {
        const {value, checked} = e.target;
        setSelectedAccountCSV([...selectedAccountCSV, value]);
        if (!checked) {
            setSelectedAccountCSV(selectedAccountCSV.filter((item) => item !== value));
        }
    }

    const handleSelectAll = (e) => {
        const {checked} = e.target;
        if (checked) setSelectedAccountCSV(accountIDs);
        else setSelectedAccountCSV([]);
    };

    function roundAmount(amount) {
        if (amount === '0') return amount;
        let amount2 = Number(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        if (amount2 === '0.00')
            amount2 = Number(amount).toFixed(6).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        return amount2;
    }

    function onChangeTypes(value, event) {
        if (event.action === "select-option" && event.option.value === '*') {
            if (selectedTypes.length === types.length) setSelectedTypes([]);
            else setSelectedTypes(types);
        } else {
            setSelectedTypes(value);
        }
    }

    function convertUTCToLocalDate(date) {
        if (!date) {
            return date
        }
        date = new Date(date)
        date = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
        return date
    }

    function convertLocalToUTCDate(date) {
        if (!date) {
            return date
        }
        date = new Date(date)
        date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        return date
    }

    const getAccounts = async () => {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accountId: JSON.parse(localStorage.getItem("accountIDs"))})
        };
        await fetch(
            process.env.REACT_APP_API + "/accounts", requestOptions
        ).then(async response => {
            const data = await response.json();
            setAccountsStatus(data['accounts']);
        }).catch(error => {
            setAccountsStatus([]);
            console.error('There was an error!', error);
            setMsg('Unknown error!');
        });
    }

    const getAccountStatus = (accountId) => {
        if (accountsStatus.length > 0) {
            const res = accountsStatus.filter(function (item) {
                return item.accountId === accountId;
            });
            return res[0] ? res[0] : [];
        }
    }

    const runTask = async (accountId) => {
        setMsg('');
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accountId: accountId})
        };
        await fetch(
            process.env.REACT_APP_API + "/run-task", requestOptions
        ).then(async response => {
            await response.json();
        }).catch(error => {
            console.error('There was an error!', error);
            setMsg('Unknown error!');
        });
        getAccounts().then();
    }

    const getTransactions = async (accountId) => {
        setMsg('Receiving data...');
        setSelectedAccountId(accountId);
        console.log('getTransactions', accountId, startDate, endDate);
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                types: Array.isArray(selectedTypes) ? selectedTypes.map(x => x.value) : [],
                accountId: [accountId],
                startDate: startDate,
                endDate: endDate
            })
        };
        await fetch(
            process.env.REACT_APP_API + "/transactions", requestOptions
        ).then(async response => {
            const data = await response.json();
            setTransactions(data.transactions);
            if (data.lastUpdate > 0) setLastUpdate(new Date(data.lastUpdate).toLocaleString());
            else setLastUpdate('');
            if (data.transactions.length === 0) setMsg('No data');
            else setMsg('');
        }).catch(error => {
            setTransactions([]);
            console.error('There was an error!', error);
            setMsg('Unknown error!');
        });
    }

    const getTransactionsCSV = async () => {
        if (selectedAccountCSV.length > 0) {
            setCsvTransactions([]);
            setMsgCSV('Please wait while the CSV file is being prepared');
            const requestOptions = {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    types: Array.isArray(selectedTypes) ? selectedTypes.map(x => x.value) : [],
                    accountId: selectedAccountCSV,
                    startDate: startDate,
                    endDate: endDate
                })
            };
            await fetch(
                process.env.REACT_APP_API + "/transactions", requestOptions
            ).then(async response => {
                const data = await response.json();
                setCsvTransactions(data.transactions);
                if (data.transactions.length === 0) {
                    setMsgCSV('No data for the csv file');
                }
            }).catch(error => {
                console.error('There was an error!', error);
                setMsgCSV('Unknown error!');
                setCsvTransactions([]);
            });
        } else {
            setCsvTransactions([]);
            setMsgCSV('');
        }
    }

    const handleChange = (e) => {
        setNewAccountId(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newAccountId) addTasks().then();
    }

    const addTasks = async () => {
        setNewAccountId('');
        setMsg('');
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({accountId: newAccountId})
        };
        await fetch(process.env.REACT_APP_API + '/add-tasks', requestOptions)
            .then(async response => {
                if (response.status === 200) {
                    if (accountIDs.indexOf(newAccountId) === -1) setAccountIDs([...accountIDs, newAccountId]);
                } else if (response.status === 400) {
                    const status = await response.json();
                    setMsg(status.error);
                    console.error(status.error);
                }
            })
            .catch(error => {
                console.error('Unknown error!', error);
                setMsg('Unknown error!');
            });
    }

    const getTypes = async () => {
        const requestOptions = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        };
        await fetch(
            process.env.REACT_APP_API + "/types", requestOptions
        ).then(async response => {
            const types = await response.json();
            setTypes(types['types']);
        }).catch(error => {
            console.error('There was an error!', error);
        });
    }

    return (
        <main>
            <nav>
                <h1>Welcome to NEAR!</h1>
                <div style={{textAlign: "center"}}>


                    {accountIDs.length > 0 ?
                        <>
                            <table className="accountsTable">
                                <thead>
                                <tr>
                                    <th>accountId</th>
                                    <th>status</th>
                                    <th>last update</th>
                                    <th></th>
                                    <th><input type="checkbox" onChange={handleSelectAll}/></th>
                                </tr>
                                </thead>
                                <tbody>
                                {accountIDs.map((accountId, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className={selectedAccountId===accountId ? 'accountIdSelected' : 'accountId'}
                                                 onClick={() => getTransactions(accountId)}>{accountId}</div>
                                        </td>
                                        <td>{getAccountStatus(accountId) ? getAccountStatus(accountId).status : null}</td>
                                        <td>{getAccountStatus(accountId) ? getAccountStatus(accountId).lastUpdate : null}</td>
                                        <td>
                                            <button className="silverBtn"
                                                    onClick={() => setAccountIDs(accountIDs.filter(item => item !== accountId))}>Delete
                                            </button>
                                            <button className="silverBtn"
                                                    onClick={() => runTask(accountId)}>Update now
                                            </button>
                                        </td>
                                        <td><input type="checkbox" checked={selectedAccountCSV.includes(accountId)}
                                                   value={accountId} onChange={addAccountCSV}/>
                                        </td>
                                    </tr>
                                ))}
                                <tr key="addAccountId">
                                    <td colSpan="2">
                                        <form onSubmit={handleSubmit}>
                                            <input type="text" onChange={handleChange} value={newAccountId}
                                                   placeholder="Add new account"/>
                                            <button type="submit" className="silverBtn">Add</button>
                                        </form>
                                    </td>
                                    <td colSpan="3" style={{textAlign: 'right'}}>
                                        {
                                            csvTransactions.length > 0 ?
                                                <CsvDownload data={csvTransactions}
                                                             filename={`transactions_${startDate.toLocaleString()}-${endDate.toLocaleString()}.csv`}>Download
                                                    as CSV</CsvDownload> : msgCSV
                                        }
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </>
                        : <>
                            <p>
                                Enter your account id:
                            </p>
                            <form onSubmit={handleSubmit}>
                                <input type="text" onChange={handleChange} value={newAccountId}/>
                                <button type="submit">Add</button>
                            </form>
                        </>
                    }

                </div>
                <div>
                    {accountIDs.length > 0 ?
                        <>
                            <div style={{textAlign: 'center', padding: '6px'}}>
                                From: <DatePicker selected={startDate} onChange={(date) => {
                                setStartDate(convertLocalToUTCDate(date));
                            }} selected={convertUTCToLocalDate(startDate)}
                                                  startDate={convertUTCToLocalDate(startDate)}
                                                  endDate={convertUTCToLocalDate(endDate)}
                                                  minDate={new Date(Date.UTC(2020, 9, 1, 0, 0, 0))}
                                                  maxDate={new Date()}
                                                  dropdownMode="select"
                                                  showMonthDropdown showYearDropdown selectsStart/>
                                To: <DatePicker selected={endDate} onChange={(date) => {
                                setEndDate(convertLocalToUTCDate(date));
                            }} selected={convertUTCToLocalDate(endDate)}
                                                startDate={convertUTCToLocalDate(startDate)}
                                                endDate={convertUTCToLocalDate(endDate)}
                                                minDate={new Date(Date.UTC(2020, 9, 1, 0, 0, 0))}
                                                maxDate={new Date().setDate(new Date().getDate() + 1)}
                                                dropdownMode="select"
                                                showMonthDropdown showYearDropdown selectsEnd/>
                            </div>
                            <MultiSelect
                                options={[{label: "--- Select All ---", value: "*"}, ...types]}
                                placeholder="Select transaction types"
                                value={selectedTypes}
                                onChange={onChangeTypes}
                                setState={setSelectedTypes}
                                isMulti
                                styles={MultiSelectStyles}
                            />
                        </>
                        : null}
                </div>
            </nav>
            <div style={{paddingTop: "10px", textAlign: "center"}}>
                {msg ? <div className="msg">{msg}</div> : null}
                {transactions.length > 0 ?
                    <>
                        <table id="transactionsTable">
                            <thead>
                            <tr>
                                <th>date UTC</th>
                                <th>txType</th>
                                <th>block_timestamp</th>
                                <th>from_account</th>
                                <th>block_height</th>
                                <th>args_base64</th>
                                <th>transaction_hash</th>
                                <th>amount</th>
                                <th>currency</th>
                                <th>amount2</th>
                                <th>currency2</th>
                                <th>receiver owner_account</th>
                                <th>receiver lockup_account</th>
                                <th>lockup_start</th>
                                <th>lockup_duration</th>
                                <th>cliff_duration</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{item.txType}</td>
                                    <td>{item.block_timestamp}</td>
                                    <td>{item.from_account}</td>
                                    <td>{item.block_height}</td>
                                    <td>{item.args_base64}</td>
                                    <td><a
                                        href={`https://explorer.mainnet.near.org/transactions/${item.transaction_hash}`}>{item.transaction_hash}</a>
                                    </td>
                                    <td>{item.amount_transferred ? roundAmount(item.amount_transferred, item.currency_transferred) : null}</td>
                                    <td>{item.currency_transferred}</td>
                                    <td>{item.amount_transferred2 ? roundAmount(item.amount_transferred2, item.currency_transferred2) : null}</td>
                                    <td>{item.currency_transferred2}</td>
                                    <td>{item.receiver_owner_account}</td>
                                    <td>{item.receiver_lockup_account}</td>
                                    <td>{item.lockup_start ? new Date(item.lockup_start / 1000000).toLocaleString() : null}</td>
                                    <td>{item.lockup_duration}</td>
                                    <td>{item.cliff_duration}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </>
                    : null
                }
            </div>
        </main>
    )
}
