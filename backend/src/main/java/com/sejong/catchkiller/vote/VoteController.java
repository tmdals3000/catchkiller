package com.sejong.catchkiller.vote;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class VoteController {

    private final SuspectVoteRepository repository;

    public VoteController(SuspectVoteRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/api/votes")
    public VoteTallyResponse getTally() {
        return toTallyResponse(repository.findAll());
    }

    @PostMapping("/api/votes")
    public VoteTallyResponse castVote(@RequestBody VoteRequest request) {
        SuspectVote target = repository.findById(request.suspectId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown suspectId: " + request.suspectId()));

        if (request.previousSuspectId() != null && !request.previousSuspectId().equals(request.suspectId())) {
            repository.findById(request.previousSuspectId()).ifPresent(previous -> {
                previous.setVoteCount(Math.max(0, previous.getVoteCount() - 1));
                repository.save(previous);
            });
        }

        target.setVoteCount(target.getVoteCount() + 1);
        repository.save(target);

        return toTallyResponse(repository.findAll());
    }

    private VoteTallyResponse toTallyResponse(List<SuspectVote> all) {
        Map<String, Long> votes = new LinkedHashMap<>();
        long total = 0;
        for (SuspectVote vote : all) {
            votes.put(vote.getSuspectId(), vote.getVoteCount());
            total += vote.getVoteCount();
        }
        return new VoteTallyResponse(votes, total);
    }
}
