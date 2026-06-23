import socket

UDP_IP = "127.0.0.1"
UDP_PORT = 8514

sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind((UDP_IP, UDP_PORT))

print(f"Syslog dumper listening on {UDP_IP}:{UDP_PORT}...")

with open("syslog_dump.txt", "a") as dump_file:
    while True:
        data, addr = sock.recvfrom(1024)
        message = data.decode('utf-8', errors='ignore')
        # Write the IP and the message to disk
        print(f"[{addr[0]}] {message}")