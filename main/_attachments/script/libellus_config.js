/* TIME */

// Note that every time should be given in milliseconds.

// How often the external timestamp gets reset (in ms)
var cfg_upd_extr_timestamp_intval = 120000;
// How often the timestamps gets updated. (in ms) (Don't ever change this)
var cfg_timestamp_tick_intval = 1000;

// How much diff time limit between local and internet time to show green circle
var cfg_time_limit_ok = 3000;

// How much diff time limit between local and internet time to show yellow circle
// If the offset exceeds this limit, it will show orange
var cfg_time_limit_warning = 6000;

// How often entries will be updated with new timestamp where there is none.
var cfg_set_extr_timestamp_on_entries_intval = 300000000;
    
/* JOURNAL */

// How often the content gets updated (in ms)
var cfg_upd_journal_intval = 1000;

// How often the comment and action counters will be updated
var cfg_upd_counters_intval = 3000;

/* ACTIONS */

// How much time until an action is set to warning
var cfg_actions_warning_time = 3600000;
// How often the background of actions gets updated (in ms)
var cfg_upd_actions_intval = 3000;

/* ATTACHMENT */

// The limit of attachment file size
var cfg_filesize_limit = 10485760;

/* CHAT */

// How often the chat content will update
var cfg_upd_chat_intval = 2000;
// How often the user list will update
var cfg_upd_chat_user_list = 5000;
// How often own user will be updated
var cfg_upd_chat_own_user = 5000;
// How long time a user can be idle before disappearing from user list
var cfg_upd_chat_idle = 60000;
// How often old users will be removed from the database
var cfg_upd_chat_remove_old_users = 10000;

// Classifications

// The key will be used as a short name that will be displayed in the journal
var cfg_classifications = {
    "internal": "Crisis team internal use",
    "employees": "Releasable to all employees",
    "trusted_partners": "Releasable to trusted partners",
    "all_partners": "Releasable to all partners",
    "media": "Releasable to the media",
}

var cfg_couchdb_username = 'libellususer';
var cfg_couchdb_password = 'libellususer'; 
