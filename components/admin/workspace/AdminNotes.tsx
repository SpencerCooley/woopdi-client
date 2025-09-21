import { Typography } from '@mui/material';
export default function AdminNotes() {
    return (
        <>
        
            <ul>
                <li>
                    <Typography variant="body1">
                    <b>superadmin</b> - A Vital Care stakeholder {`"us"`} (Spencer, Erasmo, Cindy, and Lillian)
                    </Typography>
                </li>
                <li>
                    <Typography variant="body1">
                    <b>admin</b> - A Vital Care employee (customer service agent, assistant, salespeople, etc..)
                    </Typography>
                </li>
                <li>
                    <Typography variant="body1">
                    <b>customer</b> - An adult day care organization (our customer)
                    </Typography>
                </li>
                <li>
                    <Typography variant="body1">
                    <b>user</b> - an employee of an adult day care (our customer{`'`}s employees)
                    </Typography>
                </li>
            </ul>
        </>
    )
}