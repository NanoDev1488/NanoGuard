use std::env;
use std::process;
use std::time::Instant;

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!("NanoGuard FastScan v1.0.0");
        eprintln!("Usage: nanoguard-fastscan <path_to_plugin.jar> [--json]");
        process::exit(1);
    }

    let jar_path = &args[1];
    let json_mode = args.iter().any(|a| a == "--json");

    let start = Instant::now();
    match nanoguard_fastscan::scan_jar(jar_path) {
        Ok(report) => {
            let elapsed = start.elapsed();
            if json_mode {
                if let Ok(serialized) = serde_json::to_string_pretty(&report) {
                    println!("{}", serialized);
                }
            } else {
                println!("============================================================");
                println!("           ɴᴀɴᴏɢᴜᴀʀᴅ: ꜰᴀꜱᴛꜱᴄᴀɴ ᴀᴜᴅɪᴛ ʀᴇᴘᴏʀᴛ               ");
                println!("============================================================");
                println!("File:            {}", report.jar_name);
                println!("Size:            {} KB", report.file_size_bytes / 1024);
                println!("Total Classes:   {}", report.total_classes);
                println!("Plugin Name:     {}", report.plugin_name.unwrap_or_else(|| "Unknown".to_string()));
                println!("Main Class:      {}", report.main_class.unwrap_or_else(|| "Unknown".to_string()));
                println!("Max Entropy:     {:.2} / 8.00", report.max_entropy);
                println!("Threat Score:    {}/100", report.danger_score);
                println!("Audit Time:      {:.2?}", elapsed);
                println!("------------------------------------------------------------");
                if report.threats.is_empty() {
                    println!("[+] No high-severity backdoors or malicious patterns found.");
                } else {
                    println!("[!] Detected {} threats / suspicious patterns:", report.threats.len());
                    for (idx, threat) in report.threats.iter().enumerate() {
                        println!("  #{}: [{}] {}", idx + 1, threat.severity, threat.category);
                        println!("      Location:    {}", threat.location);
                        println!("      Description: {}", threat.description);
                        if let Some(ref inst) = threat.instruction {
                            println!("      Instruction: {}", inst);
                        }
                    }
                }
                println!("============================================================");
            }
        }
        Err(e) => {
            eprintln!("[!] Scan Error: {}", e);
            process::exit(2);
        }
    }
}
