package com.sejong.catchkiller.vote;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class VoteDataSeeder implements CommandLineRunner {

    private final SuspectVoteRepository repository;

    public VoteDataSeeder(SuspectVoteRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }
        repository.save(new SuspectVote("a", "최준영", 41));
        repository.save(new SuspectVote("b", "이채린", 57));
        repository.save(new SuspectVote("c", "차승협", 33));
    }
}
